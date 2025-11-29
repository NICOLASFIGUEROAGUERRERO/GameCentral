import { jwtVerify } from "jose";

export async function onRequest({ request, locals }, next) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/session=([^;]+)/);

    if (!match) {
      locals.user = null;
      return next();
    }

    const token = match[1];
    const secret = new TextEncoder().encode(import.meta.env.SESSION_SECRET);

    const { payload } = await jwtVerify(token, secret);

    locals.user = {
      id: payload.id,
      username: payload.username,
    };
  } catch (err) {
    locals.user = null;
  }

  return next();
}