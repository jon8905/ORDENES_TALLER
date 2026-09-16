const repuestoService = require('../services/repuestoService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await repuestoService.listar());
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await repuestoService.obtenerPorId(req.params.id));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await repuestoService.crear(req.body), 'Repuesto creado', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizar(req, res) {
  try {
    return exito(res, await repuestoService.actualizar(req.params.id, req.body), 'Repuesto actualizado');
  } catch (err) {
    return error(res, err.message);
  }
}

async function eliminar(req, res) {
  try {
    await repuestoService.eliminar(req.params.id);
    return exito(res, null, 'Repuesto eliminado');
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
