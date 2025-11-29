import mysql from "mysql2/promise";

const connection = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default connection;

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
