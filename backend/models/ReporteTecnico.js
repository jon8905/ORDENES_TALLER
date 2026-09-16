const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT
    r.id_reporte, r.id_orden, r.id_tecnico, r.diagnostico, r.tipo_reparacion,
    r.descripcion_trabajo, r.recomendaciones, r.fecha_reporte, r.created_at,
    m.placa, m.marca, m.modelo, m.color,
    c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
    c.documento AS cliente_documento, c.telefono AS cliente_telefono,
    c.direccion AS cliente_direccion, c.email AS cliente_email,
    u.nombre AS tecnico_nombre, u.apellido AS tecnico_apellido
  FROM reportes_tecnicos r
  INNER JOIN ordenes_trabajo o ON o.id_orden = r.id_orden
  INNER JOIN motocicletas m ON m.id_motocicleta = o.id_motocicleta
  INNER JOIN clientes c ON c.id_cliente = m.id_cliente
  INNER JOIN tecnicos t ON t.id_tecnico = r.id_tecnico
  INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
`;

async function listar(filtros = {}) {
  let sql = SELECT_BASE + ' WHERE 1=1';
  const params = {};
  if (filtros.id_tecnico) {
    sql += ' AND r.id_tecnico = :id_tecnico';
    params.id_tecnico = filtros.id_tecnico;
  }
  if (filtros.id_orden) {
    sql += ' AND r.id_orden = :id_orden';
    params.id_orden = filtros.id_orden;
  }
  if (filtros.ocultar_entregadas) {
    sql += " AND o.estado NOT IN ('ENTREGADA', 'CANCELADA')";
  }
  if (filtros.placa) {
    sql += ' AND m.placa LIKE :placa';
    params.placa = `%${filtros.placa}%`;
  }
  sql += ' ORDER BY r.fecha_reporte DESC';
  const [filas] = await pool.query(sql, params);
  return filas;
}

async function obtenerPorId(idReporte) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE r.id_reporte = :idReporte LIMIT 1`,
    { idReporte }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO reportes_tecnicos
      (id_orden, id_tecnico, diagnostico, tipo_reparacion, descripcion_trabajo, recomendaciones)
     VALUES
      (:id_orden, :id_tecnico, :diagnostico, :tipo_reparacion, :descripcion_trabajo, :recomendaciones)`,
    datos
  );
  return resultado.insertId;
}

async function ultimoPorOrden(idOrden) {
  const [filas] = await pool.query(
    `${SELECT_BASE} WHERE r.id_orden = :idOrden ORDER BY r.fecha_reporte DESC LIMIT 1`,
    { idOrden }
  );
  return filas[0] || null;
}

module.exports = { listar, obtenerPorId, crear, ultimoPorOrden };
