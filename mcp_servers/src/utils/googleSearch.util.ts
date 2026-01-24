const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!;

export async function googleSearch(query: string, limit: number) {
  console.log("[GoogleSearch] API_KEY exists:", !!GOOGLE_API_KEY);
  console.log("[GoogleSearch] API_KEY:", GOOGLE_API_KEY);
  console.log("[GoogleSearch] CX exists:", !!GOOGLE_CX);
  console.log("[GoogleSearch] CX:", GOOGLE_CX);
  console.log("[GoogleSearch] Query:", query, "Limit:", limit);

  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?key=${GOOGLE_API_KEY}` +
    `&cx=${GOOGLE_CX}` +
    `&q=${encodeURIComponent(query)}` +
    `&num=${limit}`;

  console.log("[GoogleSearch] Request URL (masked):", url.replace(GOOGLE_API_KEY, "***"));

  const res = await fetch(url);
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("[GoogleSearch] Error response:", res.status, errorBody);
    throw new Error(`Google search failed: ${res.statusText} - ${errorBody}`);
  }

  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
  }));
}
