import type { APIRoute } from "astro";
import { jwtVerify } from "jose";

export const GET: APIRoute = async ({ request }) => {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);

    if (!match) {
      return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
    }

    const token = match[1];
    const secret = new TextEncoder().encode(import.meta.env.SESSION_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return new Response(
      JSON.stringify({
        loggedIn: true,
        user: {
          id: payload.id,
          username: payload.username,
        },
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ loggedIn: false }), { status: 200 });
  }
};
