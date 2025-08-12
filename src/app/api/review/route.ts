import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // console.log('API route /api/review received request. (Server-side)');
  try {
    const { code, prompt } = await req.json();

    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434'; // Read from env, fallback to default
    const gptOssUrl = `${ollamaApiUrl}/api/generate`; // Use the base URL

    console.log('Sending request to GPT OSS:', gptOssUrl);

    const response = await fetch(gptOssUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-oss:20b',
        prompt: `Review the following code for ${prompt}:\n\n${code}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server: GPT OSS API returned an error:', response.status, errorText);
      throw new Error(`GPT OSS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const reviewedCode = data.response || data.text || JSON.stringify(data, null, 2);

    return NextResponse.json({ reviewedCode });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Server: Error in /api/review route:', error);
      return NextResponse.json({ error: `Failed to review code: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: `Failed to review code: An unknown error occurred` }, { status: 500 });
    }
  }
}
