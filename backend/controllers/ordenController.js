const ordenService = require('../services/ordenService');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await ordenService.listar(req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await ordenService.obtenerPorId(req.params.id, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await ordenService.crear(req.body), 'Orden de trabajo creada', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizar(req, res) {
  try {
    return exito(res, await ordenService.actualizar(req.params.id, req.body), 'Orden actualizada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function cambiarEstado(req, res) {
  try {
    return exito(
      res,
      await ordenService.cambiarEstado(req.params.id, req.body.estado, req.usuario),
      'Estado actualizado'
    );
  } catch (err) {
    return error(res, err.message);
  }
}

async function asignar(req, res) {
  try {
    return exito(
      res,
      await ordenService.asignarTecnico(req.params.id, req.body.id_tecnico, req.usuario),
      'Técnico asignado'
    );
  } catch (err) {
    return error(res, err.message);
  }
}

async function listarRepuestos(req, res) {
  try {
    return exito(res, await ordenService.listarRepuestos(req.params.id, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function agregarRepuesto(req, res) {
  try {
    return exito(
      res,
      await ordenService.agregarRepuesto(req.params.id, req.body, req.usuario),
      'Repuesto agregado'
    );
  } catch (err) {
    return error(res, err.message);
  }
}

async function eliminarRepuesto(req, res) {
  try {
    return exito(
      res,
      await ordenService.eliminarRepuesto(req.params.id, req.params.idRepuesto, req.usuario),
      'Repuesto eliminado'
    );
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  cambiarEstado,
  asignar,
  listarRepuestos,
  agregarRepuesto,
  eliminarRepuesto,
};
