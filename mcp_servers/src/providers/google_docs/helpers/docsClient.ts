import fetch, { RequestInit, HeadersInit } from "node-fetch";

const GOOGLE_DOCS_BASE = "https://docs.googleapis.com/v1";

/**
 * Helper to make authenticated requests to Google Docs API
 * Now accepts accessToken as parameter instead of using env variable
 */
export async function googleDocsRequest<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GOOGLE_DOCS_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers as HeadersInit),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Docs API error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}
