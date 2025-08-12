import { NextRequest } from 'next/server';

interface ReviewRequest {
  code: string;
  prompt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { code, prompt } = await req.json() as ReviewRequest;

    const baseUrl = process.env.OLLAMA_API_URL ?? 'http://127.0.0.1:11434';
    const url = new URL('api/generate', baseUrl);

    const payload = {
      model: 'gpt-oss:20b',
      prompt: `${prompt}:\n\n---CODE---\n${code}\n---CODE---\n\nProvide ONLY the refactored code without any explanations or conversational text. Do NOT include phrases like "Here is the refactored code:".`,
      stream: true,
    };

    const ollamaRes = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!ollamaRes.ok) {
      const errMsg = await ollamaRes.text();
      console.error('GPT OSS API error', ollamaRes.status, errMsg);
      throw new Error(`GPT OSS API error: ${ollamaRes.status} - ${errMsg}`);
    }

    const reader = ollamaRes.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let leftover = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = (leftover + chunk).split('\n');
            leftover = lines.pop() ?? '';
            for (const line of lines) {
              if (!line) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                  controller.enqueue(new TextEncoder().encode(parsed.response));
                }
              } catch (e) {
                console.error('JSON parse error', e);
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Review API error', error);
    return new Response(
      JSON.stringify({ error: `Failed to review code: ${msg}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}