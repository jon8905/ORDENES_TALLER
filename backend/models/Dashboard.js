const { pool } = require('../config/db');

async function admin() {
  const [[usuarios]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  const [[tecnicos]] = await pool.query('SELECT COUNT(*) AS total FROM tecnicos WHERE activo = 1');
  const [[motos]] = await pool.query('SELECT COUNT(*) AS total FROM motocicletas');
  const [[enReparacion]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo
     WHERE estado IN ('ASIGNADA','EN_DIAGNOSTICO','EN_REPARACION','ESPERANDO_REPUESTOS')`
  );
  const [[pendientes]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo
     WHERE estado IN ('RECIBIDA','ASIGNADA','EN_DIAGNOSTICO')`
  );
  const [[terminadas]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo
     WHERE estado IN ('REPARACION_TERMINADA','LISTA_PARA_ENTREGA','ENTREGADA')`
  );
  const [[moPendiente]] = await pool.query(
    `SELECT COUNT(*) AS total FROM mano_obra WHERE estado_aprobacion = 'PENDIENTE'`
  );

  return {
    total_usuarios: usuarios.total,
    total_tecnicos: tecnicos.total,
    motocicletas_registradas: motos.total,
    motocicletas_en_reparacion: enReparacion.total,
    ordenes_pendientes: pendientes.total,
    ordenes_terminadas: terminadas.total,
    mano_obra_pendiente: moPendiente.total,
  };
}

async function jefe() {
  const [[recibidas]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado = 'RECIBIDA'`
  );
  const [[sinAsignar]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo o
     WHERE o.estado = 'RECIBIDA'
       AND NOT EXISTS (
         SELECT 1 FROM orden_tecnicos ot
         WHERE ot.id_orden = o.id_orden AND ot.estado_asignacion = 'ACTIVA'
       )`
  );
  const [[enReparacion]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo
     WHERE estado IN ('EN_DIAGNOSTICO','EN_REPARACION','ESPERANDO_REPUESTOS')`
  );
  const [[moPendiente]] = await pool.query(
    `SELECT COUNT(*) AS total FROM mano_obra WHERE estado_aprobacion = 'PENDIENTE'`
  );
  const [[tecnicos]] = await pool.query(
    'SELECT COUNT(*) AS total FROM tecnicos WHERE activo = 1'
  );
  const [[terminadas]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ordenes_trabajo
     WHERE estado IN ('REPARACION_TERMINADA','LISTA_PARA_ENTREGA')`
  );
  const [[liqPendientes]] = await pool.query(
    `SELECT COUNT(*) AS total FROM liquidaciones_tecnicos WHERE estado = 'PENDIENTE'`
  );

  return {
    motocicletas_recibidas: recibidas.total,
    pendientes_asignacion: sinAsignar.total,
    en_reparacion: enReparacion.total,
    mano_obra_pendiente: moPendiente.total,
    tecnicos_activos: tecnicos.total,
    reparaciones_terminadas: terminadas.total,
    liquidaciones_pendientes: liqPendientes.total,
  };
}

async function tecnico(idTecnico) {
  const [[asignadas]] = await pool.query(
    `SELECT COUNT(*) AS total FROM orden_tecnicos ot
     INNER JOIN ordenes_trabajo o ON o.id_orden = ot.id_orden
     WHERE ot.id_tecnico = :idTecnico
       AND ot.estado_asignacion = 'ACTIVA'
       AND o.estado NOT IN ('ENTREGADA','CANCELADA')`,
    { idTecnico }
  );
  const [[moPendiente]] = await pool.query(
    `SELECT COUNT(*) AS total FROM mano_obra
     WHERE id_tecnico = :idTecnico AND estado_aprobacion = 'PENDIENTE'`,
    { idTecnico }
  );
  const [[moAprobada]] = await pool.query(
    `SELECT COALESCE(SUM(valor_aprobado), 0) AS total FROM mano_obra
     WHERE id_tecnico = :idTecnico
       AND estado_aprobacion IN ('APROBADA','MODIFICADA')
       AND id_liquidacion IS NULL`,
    { idTecnico }
  );

  return {
    motocicletas_asignadas: asignadas.total,
    mano_obra_pendiente: moPendiente.total,
    total_mo_aprobada: moAprobada.total,
  };
}

module.exports = { admin, jefe, tecnico };
