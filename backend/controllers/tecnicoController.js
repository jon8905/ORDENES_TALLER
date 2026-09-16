const tecnicoService = require('../services/tecnicoService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    const activos = req.query.activos === '1';
    const datos = activos ? await tecnicoService.listarActivos() : await tecnicoService.listar();
    return exito(res, datos);
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await tecnicoService.obtenerPorId(req.params.id));
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizarPorcentaje(req, res) {
  try {
    const tecnico = await tecnicoService.actualizarPorcentaje(
      req.params.id,
      req.body.porcentaje_mano_obra
    );
    return exito(res, tecnico, 'Porcentaje actualizado');
  } catch (err) {
    return error(res, err.message);
  }
}

async function totales(req, res) {
  try {
    if (req.usuario.rol === 'TECNICO' && Number(req.params.id) !== Number(req.usuario.id_tecnico)) {
      return error(res, 'No puede consultar totales de otro técnico', 403);
    }
    return exito(res, await tecnicoService.totales(req.params.id));
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, actualizarPorcentaje, totales };
