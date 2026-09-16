const usuarioService = require('../services/usuarioService');
const rolModel = require('../models/Rol');
const { exito, error, noEncontrado } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await usuarioService.listar());
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    if (!usuario) return noEncontrado(res, 'Usuario no encontrado');
    return exito(res, usuario);
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    const usuario = await usuarioService.crear(req.body);
    return exito(res, usuario, 'Usuario creado', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function actualizar(req, res) {
  try {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    return exito(res, usuario, 'Usuario actualizado');
  } catch (err) {
    return error(res, err.message);
  }
}

async function cambiarEstado(req, res) {
  try {
    const usuario = await usuarioService.cambiarEstado(req.params.id, req.body.activo);
    return exito(res, usuario, 'Estado actualizado');
  } catch (err) {
    return error(res, err.message);
  }
}

async function listarRoles(req, res) {
  try {
    return exito(res, await rolModel.listar());
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, listarRoles };
