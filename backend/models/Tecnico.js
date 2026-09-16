const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    t.id_tecnico, t.id_usuario, t.porcentaje_mano_obra, t.activo,
    t.created_at, t.updated_at,
    u.nombre, u.apellido, u.documento, u.telefono, u.email
  FROM tecnicos t
  INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
`;

async function listar() {
  const [filas] = await pool.query(`${SELECT_BASE} ORDER BY t.id_tecnico DESC`);
  return filas;
}

async function listarActivos() {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE t.activo = 1 AND u.activo = 1 ORDER BY u.nombre`
  );
  return filas;
}

async function obtenerPorId(idTecnico) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE t.id_tecnico = :idTecnico LIMIT 1`,
    { idTecnico }
  );
  return filas[0] || null;
}

async function obtenerPorUsuario(idUsuario) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE t.id_usuario = :idUsuario LIMIT 1`,
    { idUsuario }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO tecnicos (id_usuario, porcentaje_mano_obra, activo)
     VALUES (:id_usuario, :porcentaje_mano_obra, :activo)`,
    datos
  );
  return resultado.insertId;
}

async function actualizarPorcentaje(idTecnico, porcentaje) {
  await pool.query(
    'UPDATE tecnicos SET porcentaje_mano_obra = :porcentaje WHERE id_tecnico = :idTecnico',
    { porcentaje, idTecnico }
  );
}

async function cambiarEstado(idTecnico, activo) {
  await pool.query(
    'UPDATE tecnicos SET activo = :activo WHERE id_tecnico = :idTecnico',
    { activo, idTecnico }
  );
}

async function cambiarEstadoPorUsuario(idUsuario, activo) {
  await pool.query(
    'UPDATE tecnicos SET activo = :activo WHERE id_usuario = :idUsuario',
    { activo, idUsuario }
  );
}

module.exports = {
  listar,
  listarActivos,
  obtenerPorId,
  obtenerPorUsuario,
  crear,
  actualizarPorcentaje,
  cambiarEstado,
  cambiarEstadoPorUsuario,
};
