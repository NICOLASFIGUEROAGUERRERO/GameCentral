import mysql from "mysql2/promise";

export async function crearConexion() {
  return mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "NICOLAS",
    database: "game_central",
  });
}

export const db = {
  // Obtener favoritos del usuario
  async getFavoritesByUserId(userId) {
    const conn = await crearConexion();
    const [rows] = await conn.execute(
      "SELECT * FROM favoritos WHERE id_user = ?",
      [userId]
    );
    await conn.end();

    // Mapear a objetos simples para JS
    return rows.map(row => ({
      id_favorito: row.id_favorito,
      id_user: row.id_user,
      game_slug: row.game_slug,
    }));
  },

  // Agregar un favorito
  async addFavorite(userId, gameSlug) {
    const conn = await crearConexion();
    const [result] = await conn.execute(
      "INSERT INTO favoritos (id_user, game_slug) VALUES (?, ?)",
      [userId, gameSlug]
    );
    await conn.end();
    return result.insertId;
  },

  // Eliminar favorito
  async removeFavorite(id) {
    const conn = await crearConexion();
    const [result] = await conn.execute(
      "DELETE FROM favoritos WHERE id_favorito = ?",
      [id]
    );
    await conn.end();
    return result.affectedRows > 0;
  },
};
