import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${SERVER_URL}/api/pi/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Pi auth login error:', error);
    return NextResponse.json(
      { error: 'Pi auth login failed' },
      { status: 500 }
    );
  }
} 