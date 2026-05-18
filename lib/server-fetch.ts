import { getBackendUrl } from './get-backend-url';

export type SnapshotResponse<T = unknown> = {
  success: boolean;
  data?: T;
  updatedAt?: string;
  error?: string;
};

export async function fetchSnapshot<T = unknown>(
  segment: string,
  revalidateSeconds = 10
): Promise<SnapshotResponse<T>> {
  const base = getBackendUrl();
  const url = `${base}/api/v2/home/${encodeURIComponent(segment)}`;
  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds, tags: [`home-${segment}`] },
  });
  const json = (await res.json()) as SnapshotResponse<T>;
  return json;
}
