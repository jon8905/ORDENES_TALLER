const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    m.id_motocicleta, m.placa, m.marca, m.modelo, m.color, m.id_cliente,
    m.created_at, m.updated_at,
    c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
    c.documento AS cliente_documento, c.telefono AS cliente_telefono,
    c.email AS cliente_email
  FROM motocicletas m
  INNER JOIN clientes c ON c.id_cliente = m.id_cliente
`;

async function listar() {
  const [filas] = await pool.query(`${SELECT_BASE} ORDER BY m.id_motocicleta DESC`);
  return filas;
}

async function obtenerPorId(idMotocicleta) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE m.id_motocicleta = :idMotocicleta LIMIT 1`,
    { idMotocicleta }
  );
  return filas[0] || null;
}

async function obtenerPorPlaca(placa) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE m.placa = :placa LIMIT 1`,
    { placa }
  );
  return filas[0] || null;
}

async function listarPorCliente(idCliente) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE m.id_cliente = :idCliente ORDER BY m.placa`,
    { idCliente }
  );
  return filas;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO motocicletas (placa, marca, modelo, color, id_cliente)
     VALUES (:placa, :marca, :modelo, :color, :id_cliente)`,
    datos
  );
  return resultado.insertId;
}

async function actualizar(idMotocicleta, datos) {
  await pool.query(
    `UPDATE motocicletas SET
      placa = :placa,
      marca = :marca,
      modelo = :modelo,
      color = :color,
      id_cliente = :id_cliente
     WHERE id_motocicleta = :idMotocicleta`,
    { ...datos, idMotocicleta }
  );
}

async function eliminar(idMotocicleta) {
  await pool.query(
    'DELETE FROM motocicletas WHERE id_motocicleta = :idMotocicleta',
    { idMotocicleta }
  );
}

async function existePlaca(placa, excluirId = null) {
  const [filas] = await pool.query(
    `SELECT id_motocicleta FROM motocicletas
     WHERE placa = :placa AND (:excluirId IS NULL OR id_motocicleta <> :excluirId)
     LIMIT 1`,
    { placa, excluirId }
  );
  return filas.length > 0;
}

async function tieneOrdenes(idMotocicleta) {
  const [filas] = await pool.query(
    'SELECT id_orden FROM ordenes_trabajo WHERE id_motocicleta = :idMotocicleta LIMIT 1',
    { idMotocicleta }
  );
  return filas.length > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorPlaca,
  listarPorCliente,
  crear,
  actualizar,
  eliminar,
  existePlaca,
  tieneOrdenes,
};
