// /lib/db.js
import mysql from "mysql2/promise";

// Pool global usando tus variables DB_*
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default {
  async getConnection() {
    return await pool.getConnection();
  }
};

// =======================
// Funciones para favoritos
// =======================
export const db = {
  async getFavoritesByUserId(userId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        "SELECT * FROM favoritos WHERE id_user = ?",
        [userId]
      );

      return rows.map(row => ({
        id_favorito: row.id_favorito,
        id_user: row.id_user,
        game_slug: row.game_slug,
      }));
    } finally {
      conn.release();
    }
  },

  async addFavorite(userId, gameSlug) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        "INSERT INTO favoritos (id_user, game_slug) VALUES (?, ?)",
        [userId, gameSlug]
      );

      return result.insertId;
    } finally {
      conn.release();
    }
  },

  async removeFavorite(id) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        "DELETE FROM favoritos WHERE id_favorito = ?",
        [id]
      );

      return result.affectedRows > 0;
    } finally {
      conn.release();
    }
  },
};
