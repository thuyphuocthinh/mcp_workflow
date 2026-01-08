const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!;

export async function googleSearch(query: string, limit: number) {
  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?key=${GOOGLE_API_KEY}` +
    `&cx=${GOOGLE_CX}` +
    `&q=${encodeURIComponent(query)}` +
    `&num=${limit}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google search failed: ${res.statusText}`);
  }

  const data = await res.json();

  return (data.items ?? []).map((item: any) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
  }));
}
