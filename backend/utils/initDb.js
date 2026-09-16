require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../database/taller_motocicletas.sql'),
    'utf8'
  );

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  await conexion.query(sql);
  await conexion.end();
  console.log('Base de datos taller_motocicletas creada.');
}

initDb().catch((err) => {
  console.error('No se pudo crear la base de datos:', err.message);
  process.exit(1);
});
