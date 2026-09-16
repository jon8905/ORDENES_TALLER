const { pool } = require('../config/db');
const liquidacionModel = require('../models/Liquidacion');
const manoObraModel = require('../models/ManoObra');
const tecnicoModel = require('../models/Tecnico');
const { campoObligatorio } = require('../utils/validaciones');

async function listar(usuario) {
  if (usuario.rol === 'TECNICO') {
    return liquidacionModel.listar(usuario.id_tecnico, 4);
  }
  return liquidacionModel.listar();
}

async function obtenerPorId(idLiquidacion, usuario) {
  const liquidacion = await liquidacionModel.obtenerPorId(idLiquidacion);
  if (!liquidacion) throw new Error('Liquidación no encontrada');
  if (usuario.rol === 'TECNICO' && liquidacion.id_tecnico !== usuario.id_tecnico) {
    throw new Error('No tiene acceso a esta liquidación');
  }
  liquidacion.detalles = await liquidacionModel.obtenerDetalles(idLiquidacion);
  return liquidacion;
}

async function calcular(idTecnico, fechaInicio, fechaFin) {
  campoObligatorio(idTecnico, 'id_tecnico');
  campoObligatorio(fechaInicio, 'fecha_inicio');
  campoObligatorio(fechaFin, 'fecha_fin');

  const tecnico = await tecnicoModel.obtenerPorId(idTecnico);
  if (!tecnico) throw new Error('Técnico no encontrado');

  const registros = await manoObraModel.aprobadasSinLiquidar(idTecnico, fechaInicio, fechaFin);
  const totalManoObra = registros.reduce((acc, item) => acc + Number(item.valor_aprobado || 0), 0);
  const porcentaje = Number(tecnico.porcentaje_mano_obra);

  return {
    tecnico: {
      id_tecnico: tecnico.id_tecnico,
      nombre: `${tecnico.nombre} ${tecnico.apellido}`,
      porcentaje_mano_obra: porcentaje,
    },
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    registros,
    total_mano_obra: Number(totalManoObra.toFixed(2)),
    porcentaje_aplicado: porcentaje,
    total_pagar: Number(((totalManoObra * porcentaje) / 100).toFixed(2)),
  };
}

async function crear(datos, usuario) {
  if (!['JEFE_TALLER', 'ADMIN'].includes(usuario.rol)) {
    throw new Error('No tiene permisos para liquidar técnicos');
  }

  const preview = await calcular(datos.id_tecnico, datos.fecha_inicio, datos.fecha_fin);
  if (preview.registros.length === 0) {
    throw new Error('No hay manos de obra aprobadas pendientes de liquidar en ese período');
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const idLiquidacion = await liquidacionModel.crear({
      id_tecnico: datos.id_tecnico,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin,
      total_mano_obra: preview.total_mano_obra,
      porcentaje_aplicado: preview.porcentaje_aplicado,
      total_pagar: preview.total_pagar,
      estado: 'LIQUIDADA',
      liquidado_por: usuario.id_usuario,
    }, conexion);

    for (const registro of preview.registros) {
      if (registro.id_liquidacion) {
        throw new Error('Una mano de obra del período ya fue liquidada');
      }
      await liquidacionModel.agregarDetalle({
        id_liquidacion: idLiquidacion,
        id_mano_obra: registro.id_mano_obra,
        valor_aplicado: registro.valor_aprobado,
      }, conexion);
      await manoObraModel.marcarLiquidada(registro.id_mano_obra, idLiquidacion, conexion);
    }

    await conexion.commit();
    return liquidacionModel.obtenerPorId(idLiquidacion);
  } catch (err) {
    await conexion.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('No se puede liquidar una mano de obra dos veces');
    }
    throw err;
  } finally {
    conexion.release();
  }
}

async function marcarPagada(idLiquidacion, usuario) {
  const liquidacion = await obtenerPorId(idLiquidacion, usuario);
  if (usuario.rol === 'TECNICO') {
    throw new Error('El técnico no puede marcar pagos');
  }
  await liquidacionModel.cambiarEstado(liquidacion.id_liquidacion, 'PAGADA');
  return obtenerPorId(idLiquidacion, usuario);
}

module.exports = { listar, obtenerPorId, calcular, crear, marcarPagada };
