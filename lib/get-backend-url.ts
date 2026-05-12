/**
 * Server-side backend URL for Next.js RSC and route handlers.
 */
export function getBackendUrl(): string {
  const raw =
    process.env.SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://localhost:4000';
  return raw.replace(/\/$/, '');
}
