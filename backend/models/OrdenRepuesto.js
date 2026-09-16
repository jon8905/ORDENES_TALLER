const { pool } = require('../config/db');

async function listarPorOrden(idOrden) {
  const [filas] = await pool.query(
    `SELECT id_orden_repuesto, id_orden, nombre, cantidad, costo_unitario, costo_total, created_at
     FROM orden_repuestos
     WHERE id_orden = :idOrden
     ORDER BY id_orden_repuesto`,
    { idOrden }
  );
  return filas;
}

async function crear({ id_orden, nombre, cantidad, costo_unitario, costo_total }) {
  const [resultado] = await pool.query(
    `INSERT INTO orden_repuestos (id_orden, nombre, cantidad, costo_unitario, costo_total)
     VALUES (:id_orden, :nombre, :cantidad, :costo_unitario, :costo_total)`,
    { id_orden, nombre, cantidad, costo_unitario, costo_total }
  );
  return resultado.insertId;
}

async function eliminar(idOrdenRepuesto, idOrden) {
  const [resultado] = await pool.query(
    `DELETE FROM orden_repuestos
     WHERE id_orden_repuesto = :idOrdenRepuesto AND id_orden = :idOrden`,
    { idOrdenRepuesto, idOrden }
  );
  return resultado.affectedRows > 0;
}

module.exports = { listarPorOrden, crear, eliminar };
