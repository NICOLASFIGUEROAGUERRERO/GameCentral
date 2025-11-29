import type { APIRoute } from "astro";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const username = form.get("username")?.toString();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();
    const confirm = form.get("confirm")?.toString();

    if (!username || !email || !password || !confirm) {
      return new Response(JSON.stringify({ success: false, message: "Campos incompletos" }), { status: 400 });
    }

    if (password !== confirm) {
      return new Response(JSON.stringify({ success: false, message: "Las contraseñas no coinciden" }), { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const conn = await db.getConnection();

    const [rows]: any = await conn.query(
      "SELECT id_user FROM usuarios WHERE nombre_usuario = ? OR correo_electronico = ?",
      [username, email]
    );

    if (rows.length > 0) {
      conn.release();
      return new Response(JSON.stringify({ success: false, message: "Usuario o correo ya registrado" }), { status: 409 });
    }

    await conn.query(
      "INSERT INTO usuarios (nombre_usuario, correo_electronico, contraseña) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    conn.release();
    return new Response(JSON.stringify({ success: true, message: "Usuario registrado correctamente" }), { status: 200 });

  } catch (err) {
    console.error("Error en register:", err);
    return new Response(JSON.stringify({ success: false, message: (err as Error).message }), { status: 500 });
  }
};
