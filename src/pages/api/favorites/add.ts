import type { APIRoute } from "astro";
import db from "@/lib/db";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!locals.user) return redirect("/login");

  const formData = await request.formData();
  const game_slug = formData.get("game_slug")?.toString();

  if (!game_slug) {
    return new Response("Falta game_slug", { status: 400 });
  }

  const conn = await db.getConnection();

  try {
    await conn.query(
      "INSERT IGNORE INTO favoritos (id_user, game_slug) VALUES (?, ?)",
      [locals.user.id, game_slug]
    );
  } catch (err) {
    console.error("Error al guardar favorito:", err);
    return new Response("Error al agregar favorito", { status: 500 });
  } finally {
    conn.release();
  }

  return redirect("/favorites");
};