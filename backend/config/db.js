const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taller_motocicletas',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  charset: 'utf8mb4',
  timezone: 'Z',
});

async function verificarConexion() {
  const conexion = await pool.getConnection();
  await conexion.ping();
  conexion.release();
}

module.exports = { pool, verificarConexion };
