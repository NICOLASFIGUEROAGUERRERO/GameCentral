import type { APIRoute } from "astro";
import db from "@/lib/db";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!locals.user) return redirect("/login");

  const formData = await request.formData();
  const id = formData.get("id");

  if (!id) {
    return new Response(JSON.stringify({
      success: false,
      message: "ID faltante"
    }), { status: 400 });
  }

  const conn = await db.getConnection();

  const [rows] = await conn.query(
    "SELECT * FROM favoritos WHERE id_favorito = ? AND id_user = ?",
    [id, locals.user.id]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    conn.release();
    return new Response(JSON.stringify({
      success: false,
      message: "Favorito no encontrado o no pertenece al usuario"
    }), { status: 404 });
  }

  await conn.query(
    "DELETE FROM favoritos WHERE id_favorito = ? AND id_user = ?",
    [id, locals.user.id]
  );

  conn.release();
  return redirect("/favorites");
};