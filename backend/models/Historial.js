const { pool } = require('../config/db');

async function buscarPorPlaca(placa) {
  const [motos] = await pool.query(
    `SELECT
       m.id_motocicleta, m.placa, m.marca, m.modelo, m.color,
       c.id_cliente, c.nombre, c.apellido, c.documento, c.telefono, c.email, c.direccion
     FROM motocicletas m
     INNER JOIN clientes c ON c.id_cliente = m.id_cliente
     WHERE m.placa = :placa
     LIMIT 1`,
    { placa }
  );

  if (!motos[0]) return null;

  const moto = motos[0];

  const [ordenes] = await pool.query(
    `SELECT
       o.id_orden, o.fecha_ingreso, o.fecha_salida, o.descripcion_problema,
       o.observaciones_ingreso, o.estado
     FROM ordenes_trabajo o
     WHERE o.id_motocicleta = :idMotocicleta
     ORDER BY o.fecha_ingreso DESC`,
    { idMotocicleta: moto.id_motocicleta }
  );

  for (const orden of ordenes) {
    const [tecnicos] = await pool.query(
      `SELECT u.nombre, u.apellido, ot.fecha_asignacion, ot.estado_asignacion
       FROM orden_tecnicos ot
       INNER JOIN tecnicos t ON t.id_tecnico = ot.id_tecnico
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
       WHERE ot.id_orden = :idOrden`,
      { idOrden: orden.id_orden }
    );

    const [manosObra] = await pool.query(
      `SELECT id_mano_obra, descripcion, valor_mano_obra, valor_aprobado, estado_aprobacion
       FROM mano_obra WHERE id_orden = :idOrden`,
      { idOrden: orden.id_orden }
    );

    const [reportes] = await pool.query(
      `SELECT id_reporte, diagnostico, tipo_reparacion, descripcion_trabajo, recomendaciones, fecha_reporte
       FROM reportes_tecnicos WHERE id_orden = :idOrden`,
      { idOrden: orden.id_orden }
    );

    for (const reporte of reportes) {
      const [repuestos] = await pool.query(
        `SELECT rp.nombre, rp.marca, rr.cantidad, rr.costo_unitario, rr.costo_total
         FROM reporte_repuestos rr
         INNER JOIN repuestos rp ON rp.id_repuesto = rr.id_repuesto
         WHERE rr.id_reporte = :idReporte`,
        { idReporte: reporte.id_reporte }
      );
      reporte.repuestos = repuestos;
    }

    orden.tecnicos = tecnicos;
    orden.mano_obra = manosObra;
    orden.reportes = reportes;

    const [repuestosOrden] = await pool.query(
      `SELECT nombre, cantidad, costo_unitario, costo_total
       FROM orden_repuestos WHERE id_orden = :idOrden`,
      { idOrden: orden.id_orden }
    );
    orden.repuestos = repuestosOrden;
  }

  return {
    motocicleta: moto,
    ultima_fecha_ingreso: ordenes[0] ? ordenes[0].fecha_ingreso : null,
    total_ingresos: ordenes.length,
    ordenes,
  };
}

module.exports = { buscarPorPlaca };
