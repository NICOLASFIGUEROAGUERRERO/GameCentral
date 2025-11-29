import type { APIRoute } from "astro";
import { crearConexion } from "@/lib/db";

export const POST: APIRoute = async ({ request, locals, redirect }) => {

  const user = locals.user;
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const id = formData.get("id");

  if (!id) {
    return new Response(JSON.stringify({
      success: false,
      message: "ID faltante"
    }), { status: 400 });
  }

  const db = await crearConexion();

  // Verificar que el favorito pertenece al usuario
  const [rows] = await db.execute(
    "SELECT * FROM favoritos WHERE id_favorito = ? AND id_user = ?",
    [id, user.id]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    await db.end();
    return new Response(JSON.stringify({
      success: false,
      message: "Favorito no encontrado o no pertenece al usuario"
    }), { status: 404 });
  }

  // Eliminar favorito
  await db.execute(
    "DELETE FROM favoritos WHERE id_favorito = ? AND id_user = ?",
    [id, user.id]
  );

  await db.end();

  return redirect("/favorites");
};
