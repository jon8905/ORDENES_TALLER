const { pool } = require('../config/db');

async function listar() {
  const [filas] = await pool.query('SELECT * FROM repuestos ORDER BY nombre');
  return filas;
}

async function obtenerPorId(idRepuesto) {
  const [filas] = await pool.query(
    'SELECT * FROM repuestos WHERE id_repuesto = :idRepuesto LIMIT 1',
    { idRepuesto }
  );
  return filas[0] || null;
}

async function crear(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO repuestos (marca, nombre, descripcion, costo)
     VALUES (:marca, :nombre, :descripcion, :costo)`,
    datos
  );
  return resultado.insertId;
}

async function actualizar(idRepuesto, datos) {
  await pool.query(
    `UPDATE repuestos SET
      marca = :marca,
      nombre = :nombre,
      descripcion = :descripcion,
      costo = :costo
     WHERE id_repuesto = :idRepuesto`,
    { ...datos, idRepuesto }
  );
}

async function eliminar(idRepuesto) {
  await pool.query('DELETE FROM repuestos WHERE id_repuesto = :idRepuesto', { idRepuesto });
}

async function agregarAReporte(datos) {
  const [resultado] = await pool.query(
    `INSERT INTO reporte_repuestos
      (id_reporte, id_repuesto, cantidad, costo_unitario, costo_total)
     VALUES
      (:id_reporte, :id_repuesto, :cantidad, :costo_unitario, :costo_total)`,
    datos
  );
  return resultado.insertId;
}

async function listarPorReporte(idReporte) {
  const [filas] = await pool.query(
    `SELECT
       rr.id_reporte_repuesto, rr.id_reporte, rr.id_repuesto,
       rr.cantidad, rr.costo_unitario, rr.costo_total,
       rp.nombre, rp.marca, rp.descripcion
     FROM reporte_repuestos rr
     INNER JOIN repuestos rp ON rp.id_repuesto = rr.id_repuesto
     WHERE rr.id_reporte = :idReporte`,
    { idReporte }
  );
  return filas;
}

async function eliminarDeReporte(idReporteRepuesto) {
  await pool.query(
    'DELETE FROM reporte_repuestos WHERE id_reporte_repuesto = :idReporteRepuesto',
    { idReporteRepuesto }
  );
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  agregarAReporte,
  listarPorReporte,
  eliminarDeReporte,
};
