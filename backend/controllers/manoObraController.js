const manoObraService = require('../services/manoObraService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await manoObraService.listar(req.usuario, req.query));
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await manoObraService.obtenerPorId(req.params.id, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await manoObraService.crear(req.body, req.usuario), 'Mano de obra registrada', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function aprobar(req, res) {
  try {
    return exito(res, await manoObraService.decidir(req.params.id, 'aprobar', req.body, req.usuario), 'Mano de obra aprobada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function modificar(req, res) {
  try {
    return exito(res, await manoObraService.decidir(req.params.id, 'modificar', req.body, req.usuario), 'Mano de obra modificada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function rechazar(req, res) {
  try {
    return exito(res, await manoObraService.decidir(req.params.id, 'rechazar', req.body, req.usuario), 'Mano de obra rechazada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function totales(req, res) {
  try {
    return exito(res, await manoObraService.totales(req.params.idTecnico, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, aprobar, modificar, rechazar, totales };
