import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, prompt } = await req.json();

    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434';
    const gptOssUrl = `${ollamaApiUrl}/api/generate`;

    const ollamaResponse = await fetch(gptOssUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss:20b',
        prompt: `Review the following code for ${prompt}:\n\n${code}`,
        stream: true, // Enable streaming
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Server: GPT OSS API returned an error:', ollamaResponse.status, errorText);
      throw new Error(`GPT OSS API error: ${ollamaResponse.status} - ${errorText}`);
    }

    // Create a ReadableStream to send the response to the client
    const stream = new ReadableStream({
      async start(controller) {
        if (!ollamaResponse.body) {
          controller.close();
          return;
        }
        const reader = ollamaResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          // The response from Ollama is a stream of JSON objects, separated by newlines.
          const jsonObjects = chunk.split('\n').filter(Boolean);
          for (const jsonObj of jsonObjects) {
            try {
              const parsed = JSON.parse(jsonObj);
              if (parsed.response) {
                // console.log(parsed.response);
                controller.enqueue(new TextEncoder().encode(parsed.response));
              }
            } catch (e) {
              console.error('Error parsing JSON chunk:', e);
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Server: Error in /api/review route:', error);
      return new Response(JSON.stringify({ error: `Failed to review code: ${error.message}` }), { status: 500 });
    } else {
      return new Response(JSON.stringify({ error: `Failed to review code: An unknown error occurred` }), { status: 500 });
    }
  }
}
