const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    u.id_usuario, u.nombre, u.apellido, u.documento, u.direccion,
    u.telefono, u.email, u.id_rol, u.activo, u.created_at, u.updated_at,
    r.nombre_rol, t.id_tecnico, t.porcentaje_mano_obra
  FROM usuarios u
  INNER JOIN roles r ON r.id_rol = u.id_rol
  LEFT JOIN tecnicos t ON t.id_usuario = u.id_usuario
`;

async function listar() {
  const [filas] = await pool.query(`${SELECT_BASE} ORDER BY u.id_usuario DESC`);
  return filas;
}

async function obtenerPorId(idUsuario) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE u.id_usuario = :idUsuario LIMIT 1`,
    { idUsuario }
  );
  return filas[0] || null;
}

async function obtenerPorEmail(email) {
  const [filas] = await pool.query(
    `SELECT
      u.id_usuario, u.nombre, u.apellido, u.documento, u.direccion,
      u.telefono, u.email, u.password, u.id_rol, u.activo,
      u.created_at, u.updated_at,
      r.nombre_rol, t.id_tecnico, t.porcentaje_mano_obra
     FROM usuarios u
     INNER JOIN roles r ON r.id_rol = u.id_rol
     LEFT JOIN tecnicos t ON t.id_usuario = u.id_usuario
     WHERE u.email = :email
     LIMIT 1`,
    { email }
  );
  return filas[0] || null;
}

async function obtenerPorDocumento(documento) {
  const [filas] = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE documento = :documento LIMIT 1',
    { documento }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios
      (nombre, apellido, documento, direccion, telefono, email, password, id_rol, activo)
     VALUES
      (:nombre, :apellido, :documento, :direccion, :telefono, :email, :password, :id_rol, :activo)`,
    datos
  );
  return resultado.insertId;
}

async function actualizar(idUsuario, datos) {
  await pool.query(
    `UPDATE usuarios SET
      nombre = :nombre,
      apellido = :apellido,
      documento = :documento,
      direccion = :direccion,
      telefono = :telefono,
      email = :email,
      id_rol = :id_rol,
      activo = :activo
     WHERE id_usuario = :idUsuario`,
    { ...datos, idUsuario }
  );
}

async function actualizarPassword(idUsuario, password) {
  await pool.query(
    'UPDATE usuarios SET password = :password WHERE id_usuario = :idUsuario',
    { password, idUsuario }
  );
}

async function cambiarEstado(idUsuario, activo) {
  await pool.query(
    'UPDATE usuarios SET activo = :activo WHERE id_usuario = :idUsuario',
    { activo, idUsuario }
  );
}

async function existeEmail(email, excluirId = null) {
  const [filas] = await pool.query(
    `SELECT id_usuario FROM usuarios
     WHERE email = :email AND (:excluirId IS NULL OR id_usuario <> :excluirId)
     LIMIT 1`,
    { email, excluirId }
  );
  return filas.length > 0;
}

async function existeDocumento(documento, excluirId = null) {
  const [filas] = await pool.query(
    `SELECT id_usuario FROM usuarios
     WHERE documento = :documento AND (:excluirId IS NULL OR id_usuario <> :excluirId)
     LIMIT 1`,
    { documento, excluirId }
  );
  return filas.length > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorEmail,
  obtenerPorDocumento,
  crear,
  actualizar,
  actualizarPassword,
  cambiarEstado,
  existeEmail,
  existeDocumento,
};
