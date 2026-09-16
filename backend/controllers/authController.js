const authService = require('../services/authService');
const usuarioService = require('../services/usuarioService');
const { exito, error } = require('../utils/respuestas');

async function login(req, res) {
  try {
    const datos = await authService.login(req.body.email, req.body.password);
    return exito(res, datos, 'Sesión iniciada');
  } catch (err) {
    return error(res, err.message, 401);
  }
}

async function perfil(req, res) {
  try {
    const usuario = await usuarioService.obtenerPorId(req.usuario.id_usuario);
    return exito(res, usuario);
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { login, perfil };
