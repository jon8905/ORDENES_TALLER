const { pool } = require('../config/db');

async function listar() {
  const [filas] = await pool.query(
    'SELECT id_rol, nombre_rol, descripcion, created_at, updated_at FROM roles ORDER BY id_rol'
  );
  return filas;
}

async function obtenerPorNombre(nombreRol) {
  const [filas] = await pool.query(
    'SELECT * FROM roles WHERE nombre_rol = :nombreRol LIMIT 1',
    { nombreRol }
  );
  return filas[0] || null;
}

async function obtenerPorId(idRol) {
  const [filas] = await pool.query(
    'SELECT * FROM roles WHERE id_rol = :idRol LIMIT 1',
    { idRol }
  );
  return filas[0] || null;
}

module.exports = { listar, obtenerPorNombre, obtenerPorId };
