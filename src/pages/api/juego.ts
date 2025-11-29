import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug");
  const apiKey = import.meta.env.RAWG_API_KEY;

  if (!slug) {
    return new Response(
      JSON.stringify({ error: "No slug provided" }),
      { status: 400 }
    );
  }

  const gameRes = await fetch(`https://api.rawg.io/api/games/${slug}?key=${apiKey}`);
  const gameData = await gameRes.json();

  const screenshotsRes = await fetch(`https://api.rawg.io/api/games/${slug}/screenshots?key=${apiKey}`);
  const screenshotsData = (screenshotsRes.ok ? await screenshotsRes.json() : { results: [] });
  gameData.short_screenshots = screenshotsData.results;

  const clipsRes = await fetch(`https://api.rawg.io/api/games/${slug}/movies?key=${apiKey}`);
  const clipsData = (clipsRes.ok ? await clipsRes.json() : { results: [] });
  gameData.clip = clipsData.results?.[0] || null;

  return new Response(JSON.stringify(gameData));
};
