import type { APIRoute } from "astro";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const username = form.get("username")?.toString();
    const password = form.get("password")?.toString();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: "Campos incompletos" }), { status: 400 });
    }

    const conn = await db.getConnection();

    const [rows]: any = await conn.query(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? OR correo_electronico = ?",
      [username, username]
    );

    if (!rows.length) {
      conn.release();
      return new Response(JSON.stringify({ success: false, message: "Usuario no encontrado" }), { status: 404 });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.contraseña);

    if (!passwordMatch) {
      conn.release();
      return new Response(JSON.stringify({ success: false, message: "Contraseña incorrecta" }), { status: 401 });
    }

    await conn.query("INSERT INTO login_logs (id_user) VALUES (?)", [user.id_user]);
    conn.release();

    const secret = new TextEncoder().encode(import.meta.env.SESSION_SECRET);
    const token = await new SignJWT({
      id: user.id_user,
      username: user.nombre_usuario,
      sessionId: nanoid()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const headers = new Headers();
    headers.append("Set-Cookie", `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

    return new Response(JSON.stringify({ success: true, message: "Inicio de sesión exitoso" }), { status: 200, headers });

  } catch (err) {
    console.error("Error en login:", err);
    return new Response(JSON.stringify({ success: false, message: (err as Error).message }), { status: 500 });
  }
};
