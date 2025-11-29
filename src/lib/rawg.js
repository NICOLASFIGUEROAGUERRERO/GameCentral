export async function getGameBySlug(slug) {
  const apiKey = import.meta.env.RAWG_API_KEY;

  const url = `https://api.rawg.io/api/games/${slug}?key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error(`Error RAWG →`, res.status, url);
    return null;
  }

  return res.json();
}

