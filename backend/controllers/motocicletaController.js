const motocicletaService = require('../services/motocicletaService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    if (req.query.placa) {
      return exito(res, await motocicletaService.buscarPorPlaca(req.query.placa));
    }
    if (req.query.id_cliente) {
      return exito(res, await motocicletaService.listarPorCliente(req.query.id_cliente));
    }
    return exito(res, await motocicletaService.listar());
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await motocicletaService.obtenerPorId(req.params.id));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await motocicletaService.crear(req.body), 'Motocicleta registrada', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizar(req, res) {
  try {
    return exito(res, await motocicletaService.actualizar(req.params.id, req.body), 'Motocicleta actualizada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function eliminar(req, res) {
  try {
    await motocicletaService.eliminar(req.params.id);
    return exito(res, null, 'Motocicleta eliminada');
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
