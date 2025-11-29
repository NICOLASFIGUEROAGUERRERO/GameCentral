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

  // Fetch datos principales del juego
  const gameRes = await fetch(`https://api.rawg.io/api/games/${slug}?key=${apiKey}`);
  if (!gameRes.ok) {
    return new Response(
      JSON.stringify({ error: "Game not found" }),
      { status: gameRes.status }
    );
  }
  const gameData = await gameRes.json();

  // Fetch screenshots
  const screenshotsRes = await fetch(`https://api.rawg.io/api/games/${slug}/screenshots?key=${apiKey}`);
  if (screenshotsRes.ok) {
    const screenshotsData = await screenshotsRes.json();
    gameData.short_screenshots = screenshotsData.results ?? [];
  } else {
    gameData.short_screenshots = [];
  }

  // Fetch clips
  const clipsRes = await fetch(`https://api.rawg.io/api/games/${slug}/movies?key=${apiKey}`);
  if (clipsRes.ok) {
    const clipsData = await clipsRes.json();
    // RAWG devuelve un array en 'results', tomamos el primero como clip principal
    gameData.clip = clipsData.results && clipsData.results.length > 0 ? clipsData.results[0] : null;
  } else {
    gameData.clip = null;
  }

  return new Response(JSON.stringify(gameData));
};
