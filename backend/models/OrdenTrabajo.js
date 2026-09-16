const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    o.id_orden, o.id_motocicleta, o.fecha_ingreso, o.descripcion_problema,
    o.observaciones_ingreso, o.estado, o.fecha_salida, o.created_at, o.updated_at,
    m.placa, m.marca, m.modelo, m.color,
    c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
    c.documento AS cliente_documento, c.telefono AS cliente_telefono
  FROM ordenes_trabajo o
  INNER JOIN motocicletas m ON m.id_motocicleta = o.id_motocicleta
  INNER JOIN clientes c ON c.id_cliente = m.id_cliente
`;

async function listar() {
  const [filas] = await pool.query(`${SELECT_BASE} ORDER BY o.fecha_ingreso DESC`);
  return filas;
}

async function listarActivas() {
  const [filas] = await pool.query(
    `${SELECT_BASE}
     WHERE o.estado NOT IN ('ENTREGADA', 'CANCELADA')
     ORDER BY o.fecha_ingreso DESC`
  );
  return filas;
}

async function obtenerPorId(idOrden) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE o.id_orden = :idOrden LIMIT 1`,
    { idOrden }
  );
  return filas[0] || null;
}

async function listarPorTecnico(idTecnico) {
  const [filas] = await pool.query(
    `${SELECT_BASE}
     INNER JOIN orden_tecnicos ot ON ot.id_orden = o.id_orden
     WHERE ot.id_tecnico = :idTecnico
       AND ot.estado_asignacion = 'ACTIVA'
       AND o.estado NOT IN ('ENTREGADA', 'CANCELADA')
     ORDER BY o.fecha_ingreso DESC`,
    { idTecnico }
  );
  return filas;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO ordenes_trabajo
      (id_motocicleta, fecha_ingreso, descripcion_problema, observaciones_ingreso, estado)
     VALUES
      (:id_motocicleta, :fecha_ingreso, :descripcion_problema, :observaciones_ingreso, :estado)`,
    datos
  );
  return resultado.insertId;
}

async function actualizar(idOrden, datos) {
  await pool.query(
    `UPDATE ordenes_trabajo SET
      descripcion_problema = :descripcion_problema,
      observaciones_ingreso = :observaciones_ingreso
     WHERE id_orden = :idOrden`,
    { ...datos, idOrden }
  );
}

async function cambiarEstado(idOrden, estado, fechaSalida = null) {
  await pool.query(
    `UPDATE ordenes_trabajo SET
      estado = :estado,
      fecha_salida = :fechaSalida
     WHERE id_orden = :idOrden`,
    { estado, fechaSalida, idOrden }
  );
}

async function tecnicosDeOrden(idOrden) {
  const [filas] = await pool.query(
    `SELECT
      ot.id_orden_tecnico, ot.id_orden, ot.id_tecnico, ot.fecha_asignacion,
      ot.asignado_por, ot.estado_asignacion,
      u.nombre, u.apellido, t.porcentaje_mano_obra
     FROM orden_tecnicos ot
     INNER JOIN tecnicos t ON t.id_tecnico = ot.id_tecnico
     INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
     WHERE ot.id_orden = :idOrden
     ORDER BY ot.fecha_asignacion`,
    { idOrden }
  );
  return filas;
}

async function asignarTecnico({ id_orden, id_tecnico, asignado_por }) {
  const [resultado] = await pool.query(
    `INSERT INTO orden_tecnicos (id_orden, id_tecnico, asignado_por, estado_asignacion)
     VALUES (:id_orden, :id_tecnico, :asignado_por, 'ACTIVA')
     ON DUPLICATE KEY UPDATE
       estado_asignacion = 'ACTIVA',
       asignado_por = VALUES(asignado_por),
       fecha_asignacion = CURRENT_TIMESTAMP`,
    { id_orden, id_tecnico, asignado_por }
  );
  return resultado.insertId;
}

async function tecnicoAsignado(idOrden, idTecnico) {
  const [filas] = await pool.query(
    `SELECT id_orden_tecnico FROM orden_tecnicos
     WHERE id_orden = :idOrden AND id_tecnico = :idTecnico
       AND estado_asignacion = 'ACTIVA'
     LIMIT 1`,
    { idOrden, idTecnico }
  );
  return filas.length > 0;
}

module.exports = {
  listar,
  listarActivas,
  obtenerPorId,
  listarPorTecnico,
  crear,
  actualizar,
  cambiarEstado,
  tecnicosDeOrden,
  asignarTecnico,
  tecnicoAsignado,
};
