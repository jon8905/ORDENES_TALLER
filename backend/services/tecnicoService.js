const tecnicoModel = require('../models/Tecnico');
const manoObraModel = require('../models/ManoObra');
const { validarPorcentaje } = require('../utils/validaciones');

async function listar() {
  return tecnicoModel.listar();
}

async function listarActivos() {
  return tecnicoModel.listarActivos();
}

async function obtenerPorId(idTecnico) {
  const tecnico = await tecnicoModel.obtenerPorId(idTecnico);
  if (!tecnico) throw new Error('Técnico no encontrado');
  return tecnico;
}

async function actualizarPorcentaje(idTecnico, porcentaje) {
  const tecnico = await obtenerPorId(idTecnico);
  const valor = validarPorcentaje(porcentaje);
  await tecnicoModel.actualizarPorcentaje(tecnico.id_tecnico, valor);
  return obtenerPorId(idTecnico);
}

async function totales(idTecnico) {
  const tecnico = await obtenerPorId(idTecnico);
  const totalesMo = await manoObraModel.totalesTecnico(idTecnico);
  const porcentaje = Number(tecnico.porcentaje_mano_obra);
  const totalSinLiquidar = Number(totalesMo.total_sin_liquidar);

  return {
    id_tecnico: tecnico.id_tecnico,
    nombre: `${tecnico.nombre} ${tecnico.apellido}`,
    porcentaje_tecnico: porcentaje,
    total_mo_aprobada: totalSinLiquidar,
    total_sin_liquidar: totalSinLiquidar,
    total_a_pagar: Number(((totalSinLiquidar * porcentaje) / 100).toFixed(2)),
    total_pendiente_liquidar: Number(((totalSinLiquidar * porcentaje) / 100).toFixed(2)),
  };
}

module.exports = { listar, listarActivos, obtenerPorId, actualizarPorcentaje, totales };
