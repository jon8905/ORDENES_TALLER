const { verificarToken } = require('../utils/jwt');
const { noAutorizado } = require('../utils/respuestas');
const usuarioService = require('../services/usuarioService');

async function authenticateToken(req, res, next) {
  try {
    const encabezado = req.headers.authorization || '';
    const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;

    if (!token) {
      return noAutorizado(res, 'Token no proporcionado');
    }

    const payload = verificarToken(token);
    const usuario = await usuarioService.obtenerPorId(payload.id_usuario);

    if (!usuario || !usuario.activo) {
      return noAutorizado(res, 'Usuario inactivo o inexistente');
    }

    req.usuario = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.nombre_rol,
      id_rol: usuario.id_rol,
      id_tecnico: usuario.id_tecnico || null,
      porcentaje_mano_obra: usuario.porcentaje_mano_obra || null,
    };

    return next();
  } catch (err) {
    return noAutorizado(res, 'Token inválido o expirado');
  }
}

module.exports = authenticateToken;
