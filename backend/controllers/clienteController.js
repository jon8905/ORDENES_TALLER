const clienteService = require('../services/clienteService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await clienteService.listar());
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await clienteService.obtenerPorId(req.params.id));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await clienteService.crear(req.body), 'Cliente creado', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizar(req, res) {
  try {
    return exito(res, await clienteService.actualizar(req.params.id, req.body), 'Cliente actualizado');
  } catch (err) {
    return error(res, err.message);
  }
}

async function eliminar(req, res) {
  try {
    await clienteService.eliminar(req.params.id);
    return exito(res, null, 'Cliente eliminado');
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
