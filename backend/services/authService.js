const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/Usuario');
const { generarToken } = require('../utils/jwt');
const { campoObligatorio, validarEmail } = require('../utils/validaciones');

async function login(email, password) {
  campoObligatorio(email, 'email');
  campoObligatorio(password, 'password');
  validarEmail(email);

  const usuario = await usuarioModel.obtenerPorEmail(email.trim().toLowerCase());
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }
  if (!usuario.activo) {
    throw new Error('El usuario está inactivo');
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    throw new Error('Credenciales inválidas');
  }

  const token = generarToken({
    id_usuario: usuario.id_usuario,
    rol: usuario.nombre_rol,
  });

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.nombre_rol,
      id_tecnico: usuario.id_tecnico || null,
      porcentaje_mano_obra: usuario.porcentaje_mano_obra || null,
    },
  };
}

module.exports = { login };
