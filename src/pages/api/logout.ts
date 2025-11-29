import type { APIRoute } from "astro";

export const POST: APIRoute = async () => {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
  );

  // ⬅️ Redirigir al index
  headers.append("Location", "/");

  return new Response(null, {
    status: 302,
    headers,
  });
};
