import type { APIRoute } from "astro";
import { crearConexion } from "src/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const username = form.get("username")?.toString();
    const password = form.get("password")?.toString();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Campos incompletos" }),
        { status: 400 }
      );
    }

    const conexion = await crearConexion();
    if (!conexion)
      return new Response(
        JSON.stringify({ success: false, message: "Error de conexión" }),
        { status: 500 }
      );

    // Buscar usuario por nombre o correo
    const [rows]: any = await conexion.execute(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? OR correo_electronico = ?",
      [username, username]
    );

    if (!rows.length) {
      await conexion.end();
      return new Response(
        JSON.stringify({ success: false, message: "Usuario no encontrado" }),
        { status: 404 }
      );
    }

    const user = rows[0];

    // Comparar contraseña
    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) {
      await conexion.end();
      return new Response(
        JSON.stringify({ success: false, message: "Contraseña incorrecta" }),
        { status: 401 }
      );
    }

    // Registrar login en login_logs
    await conexion.execute(
      "INSERT INTO login_logs (id_user) VALUES (?)",
      [user.id_user]
    );

    await conexion.end();

   
    //   CREAR SESIÓN (JWT FIRMADO)
    const secret = new TextEncoder().encode(import.meta.env.SESSION_SECRET);

    const token = await new SignJWT({
      id: user.id_user,
      username: user.nombre_usuario,
      sessionId: nanoid(), // ID único de sesión
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: user.id_user,
          username: user.nombre_usuario,
        },
      }),
      { status: 200, headers }
    );

  } catch (err) {
    console.error("Error en login:", err);
    return new Response(
      JSON.stringify({ success: false, message: (err as Error).message }),
      { status: 500 }
    );
  }
};
