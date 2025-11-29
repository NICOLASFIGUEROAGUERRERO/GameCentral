import mysql from "mysql2/promise";

export async function crearConexion() {
  return mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: Number(import.meta.env.DB_PORT), 
  });
}

export const db = {
  async getFavoritesByUserId(userId) {
    const conn = await crearConexion();
    const [rows] = await conn.execute(
      "SELECT * FROM favoritos WHERE id_user = ?",
      [userId]
    );
    await conn.end();
    return rows.map(row => ({
      id_favorito: row.id_favorito,
      id_user: row.id_user,
      game_slug: row.game_slug,
    }));
  },

  async addFavorite(userId, gameSlug) {
    const conn = await crearConexion();
    const [result] = await conn.execute(
      "INSERT INTO favoritos (id_user, game_slug) VALUES (?, ?)",
      [userId, gameSlug]
    );
    await conn.end();
    return result.insertId;
  },

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
