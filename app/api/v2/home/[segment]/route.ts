import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/get-backend-url';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ segment: string }> }
) {
  const { segment } = await context.params;
  const base = getBackendUrl();
  const url = `${base}/api/v2/home/${encodeURIComponent(segment)}`;
  const upstream = await fetch(url);
  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': upstream.headers.get('Cache-Control') || 'public, max-age=10',
    },
  });
  return res;
}
