import { NextRequest, NextResponse } from 'next/server';

// Define types directly in this file to avoid import issues
interface Message {
  id: string;
  sender: 'llm1' | 'llm2';
  content: string;
  timestamp: number;
}

interface ConversationData {
  messages: Message[];
  metadata: {
    llm1Name: string;
    llm2Name: string;
    topic: string;
  };
}

// No more mock data; use Python backend for both init and generation

export async function GET() {
  try {
    const PY_BACKEND = process.env.NEXT_PUBLIC_PY_BACKEND_URL || process.env.PY_BACKEND_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${PY_BACKEND}/init`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.text();
      console.error('Python backend /init error:', err);
      return NextResponse.json(
        { error: 'Failed to fetch conversation data' },
        { status: 500 }
      );
    }
    const data: ConversationData = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const PY_BACKEND = process.env.NEXT_PUBLIC_PY_BACKEND_URL || process.env.PY_BACKEND_URL || 'http://127.0.0.1:8000';
    const body = await request.json();
    console.log('[conversation POST] forwarding to Python with speaker =', body?.speaker);

    const pyRes = await fetch(`${PY_BACKEND}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!pyRes.ok) {
      const err = await pyRes.text();
      console.error('Python backend error:', err);
      return NextResponse.json({ error: 'Backend failed' }, { status: 500 });
    }

    const data = await pyRes.json();
    console.log('[conversation POST] Python returned sender =', (data as any)?.sender);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
} 