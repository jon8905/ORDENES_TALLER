const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    mo.id_mano_obra, mo.id_orden, mo.id_tecnico, mo.descripcion,
    mo.valor_mano_obra, mo.estado_aprobacion, mo.valor_aprobado,
    mo.aprobado_por, mo.fecha_registro, mo.fecha_aprobacion,
    mo.observaciones_jefe, mo.id_liquidacion,
    m.placa, o.descripcion_problema,
    tu.nombre AS tecnico_nombre, tu.apellido AS tecnico_apellido,
    au.nombre AS aprobador_nombre, au.apellido AS aprobador_apellido
  FROM mano_obra mo
  INNER JOIN ordenes_trabajo o ON o.id_orden = mo.id_orden
  INNER JOIN motocicletas m ON m.id_motocicleta = o.id_motocicleta
  INNER JOIN tecnicos t ON t.id_tecnico = mo.id_tecnico
  INNER JOIN usuarios tu ON tu.id_usuario = t.id_usuario
  LEFT JOIN usuarios au ON au.id_usuario = mo.aprobado_por
`;

async function listar(filtros = {}) {
  let sql = SELECT_BASE + ' WHERE 1=1';
  const params = {};

  if (filtros.id_tecnico) {
    sql += ' AND mo.id_tecnico = :id_tecnico';
    params.id_tecnico = filtros.id_tecnico;
  }
  if (filtros.id_orden) {
    sql += ' AND mo.id_orden = :id_orden';
    params.id_orden = filtros.id_orden;
  }
  if (filtros.estado_aprobacion) {
    sql += ' AND mo.estado_aprobacion = :estado_aprobacion';
    params.estado_aprobacion = filtros.estado_aprobacion;
  }
  if (filtros.ocultar_entregadas) {
    sql += " AND o.estado NOT IN ('ENTREGADA', 'CANCELADA')";
  }

  sql += ' ORDER BY mo.fecha_registro DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(idManoObra) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE mo.id_mano_obra = :idManoObra LIMIT 1`,
    { idManoObra }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO mano_obra
      (id_orden, id_tecnico, descripcion, valor_mano_obra, estado_aprobacion)
     VALUES
      (:id_orden, :id_tecnico, :descripcion, :valor_mano_obra, 'PENDIENTE')`,
    datos
  );
  return resultado.insertId;
}

async function actualizarAprobacion(idManoObra, datos) {
  await pool.query(
    `UPDATE mano_obra SET
      estado_aprobacion = :estado_aprobacion,
      valor_aprobado = :valor_aprobado,
      aprobado_por = :aprobado_por,
      fecha_aprobacion = :fecha_aprobacion,
      observaciones_jefe = :observaciones_jefe
     WHERE id_mano_obra = :idManoObra`,
    { ...datos, idManoObra }
  );
}

async function marcarLiquidada(idManoObra, idLiquidacion, conexion) {
  const db = conexion || pool;
  await db.query(
    'UPDATE mano_obra SET id_liquidacion = :idLiquidacion WHERE id_mano_obra = :idManoObra',
    { idLiquidacion, idManoObra }
  );
}

async function pendientesAprobacion() {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE mo.estado_aprobacion = 'PENDIENTE' ORDER BY mo.fecha_registro`
  );
  return filas;
}

async function aprobadasSinLiquidar(idTecnico, fechaInicio, fechaFin) {
  const [filas] = await pool.query(
    `${SELECT_BASE}
     WHERE mo.id_tecnico = :idTecnico
       AND mo.estado_aprobacion IN ('APROBADA', 'MODIFICADA')
       AND mo.id_liquidacion IS NULL
       AND DATE(mo.fecha_aprobacion) BETWEEN :fechaInicio AND :fechaFin
     ORDER BY mo.fecha_aprobacion`,
    { idTecnico, fechaInicio, fechaFin }
  );
  return filas;
}

async function totalesTecnico(idTecnico) {
  const [filas] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE
         WHEN estado_aprobacion IN ('APROBADA', 'MODIFICADA')
         THEN valor_aprobado ELSE 0 END), 0) AS total_aprobado,
       COALESCE(SUM(CASE
         WHEN estado_aprobacion IN ('APROBADA', 'MODIFICADA') AND id_liquidacion IS NULL
         THEN valor_aprobado ELSE 0 END), 0) AS total_sin_liquidar,
       COUNT(*) AS cantidad_registros
     FROM mano_obra
     WHERE id_tecnico = :idTecnico`,
    { idTecnico }
  );
  return filas[0];
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizarAprobacion,
  marcarLiquidada,
  pendientesAprobacion,
  aprobadasSinLiquidar,
  totalesTecnico,
};
