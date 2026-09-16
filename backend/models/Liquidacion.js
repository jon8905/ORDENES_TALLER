const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    l.id_liquidacion, l.id_tecnico, l.fecha_inicio, l.fecha_fin,
    l.total_mano_obra, l.porcentaje_aplicado, l.total_pagar,
    l.estado, l.liquidado_por, l.fecha_liquidacion, l.created_at,
    u.nombre AS tecnico_nombre, u.apellido AS tecnico_apellido,
    lu.nombre AS liquidador_nombre, lu.apellido AS liquidador_apellido
  FROM liquidaciones_tecnicos l
  INNER JOIN tecnicos t ON t.id_tecnico = l.id_tecnico
  INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
  INNER JOIN usuarios lu ON lu.id_usuario = l.liquidado_por
`;

async function listar(idTecnico = null, limite = null) {
  let sql = SELECT_BASE;
  const params = {};
  if (idTecnico) {
    sql += ' WHERE l.id_tecnico = :idTecnico';
    params.idTecnico = idTecnico;
  }
  sql += ' ORDER BY l.fecha_liquidacion DESC';
  if (limite) {
    const tope = Number(limite);
    if (!Number.isInteger(tope) || tope <= 0) {
      throw new Error('El límite de liquidaciones no es válido');
    }
    sql += ` LIMIT ${tope}`;
  }
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(idLiquidacion) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE l.id_liquidacion = :idLiquidacion LIMIT 1`,
    { idLiquidacion }
  );
  return filas[0] || null;
}

async function crear(datos, conexion) {
  const db = conexion || pool;
  const [resultado] = await db.query(
    `INSERT INTO liquidaciones_tecnicos
      (id_tecnico, fecha_inicio, fecha_fin, total_mano_obra, porcentaje_aplicado,
       total_pagar, estado, liquidado_por, fecha_liquidacion)
     VALUES
      (:id_tecnico, :fecha_inicio, :fecha_fin, :total_mano_obra, :porcentaje_aplicado,
       :total_pagar, :estado, :liquidado_por, NOW())`,
    datos
  );
  return resultado.insertId;
}

async function agregarDetalle({ id_liquidacion, id_mano_obra, valor_aplicado }, conexion) {
  const db = conexion || pool;
  await db.query(
    `INSERT INTO liquidacion_detalles (id_liquidacion, id_mano_obra, valor_aplicado)
     VALUES (:id_liquidacion, :id_mano_obra, :valor_aplicado)`,
    { id_liquidacion, id_mano_obra, valor_aplicado }
  );
}

async function obtenerDetalles(idLiquidacion) {
  const [filas] = await pool.query(
    `SELECT
       ld.id_detalle, ld.id_mano_obra, ld.valor_aplicado,
       mo.descripcion, mo.valor_mano_obra, mo.valor_aprobado,
       mo.fecha_aprobacion, m.placa
     FROM liquidacion_detalles ld
     INNER JOIN mano_obra mo ON mo.id_mano_obra = ld.id_mano_obra
     INNER JOIN ordenes_trabajo o ON o.id_orden = mo.id_orden
     INNER JOIN motocicletas m ON m.id_motocicleta = o.id_motocicleta
     WHERE ld.id_liquidacion = :idLiquidacion`,
    { idLiquidacion }
  );
  return filas;
}

async function cambiarEstado(idLiquidacion, estado) {
  await pool.query(
    'UPDATE liquidaciones_tecnicos SET estado = :estado WHERE id_liquidacion = :idLiquidacion',
    { estado, idLiquidacion }
  );
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  agregarDetalle,
  obtenerDetalles,
  cambiarEstado,
};
