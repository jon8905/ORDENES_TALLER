const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/Usuario');
const tecnicoModel = require('../models/Tecnico');
const rolModel = require('../models/Rol');
const {
  campoObligatorio,
  validarEmail,
  validarPorcentaje,
} = require('../utils/validaciones');

function sanitizar(usuario) {
  if (!usuario) return null;
  const copia = { ...usuario };
  delete copia.password;
  return copia;
}

async function listar() {
  const usuarios = await usuarioModel.listar();
  return usuarios.map(sanitizar);
}

async function obtenerPorId(idUsuario) {
  return sanitizar(await usuarioModel.obtenerPorId(idUsuario));
}

async function crear(datos) {
  campoObligatorio(datos.nombre, 'nombre');
  campoObligatorio(datos.apellido, 'apellido');
  campoObligatorio(datos.documento, 'documento');
  campoObligatorio(datos.email, 'email');
  campoObligatorio(datos.password, 'password');
  campoObligatorio(datos.id_rol, 'id_rol');
  validarEmail(datos.email);

  if (await usuarioModel.existeEmail(datos.email)) {
    throw new Error('El correo electrónico ya está registrado');
  }
  if (await usuarioModel.existeDocumento(datos.documento)) {
    throw new Error('El documento ya está registrado');
  }

  const rol = await rolModel.obtenerPorId(datos.id_rol);
  if (!rol) throw new Error('El rol seleccionado no existe');

  let porcentaje = null;
  if (rol.nombre_rol === 'TECNICO') {
    porcentaje = validarPorcentaje(datos.porcentaje_mano_obra);
  }

  const hash = await bcrypt.hash(datos.password, 10);
  const idUsuario = await usuarioModel.crear({
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    documento: String(datos.documento).trim(),
    direccion: datos.direccion || null,
    telefono: datos.telefono || null,
    email: datos.email.trim().toLowerCase(),
    password: hash,
    id_rol: datos.id_rol,
    activo: datos.activo === undefined ? 1 : Number(datos.activo),
  });

  if (rol.nombre_rol === 'TECNICO') {
    await tecnicoModel.crear({
      id_usuario: idUsuario,
      porcentaje_mano_obra: porcentaje,
      activo: 1,
    });
  }

  return obtenerPorId(idUsuario);
}

async function actualizar(idUsuario, datos) {
  const actual = await usuarioModel.obtenerPorId(idUsuario);
  if (!actual) throw new Error('Usuario no encontrado');

  campoObligatorio(datos.nombre, 'nombre');
  campoObligatorio(datos.apellido, 'apellido');
  campoObligatorio(datos.documento, 'documento');
  campoObligatorio(datos.email, 'email');
  campoObligatorio(datos.id_rol, 'id_rol');
  validarEmail(datos.email);

  if (await usuarioModel.existeEmail(datos.email, idUsuario)) {
    throw new Error('El correo electrónico ya está registrado');
  }
  if (await usuarioModel.existeDocumento(datos.documento, idUsuario)) {
    throw new Error('El documento ya está registrado');
  }

  const rol = await rolModel.obtenerPorId(datos.id_rol);
  if (!rol) throw new Error('El rol seleccionado no existe');

  await usuarioModel.actualizar(idUsuario, {
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    documento: String(datos.documento).trim(),
    direccion: datos.direccion || null,
    telefono: datos.telefono || null,
    email: datos.email.trim().toLowerCase(),
    id_rol: datos.id_rol,
    activo: datos.activo === undefined ? actual.activo : Number(datos.activo),
  });

  if (datos.password && String(datos.password).trim() !== '') {
    const hash = await bcrypt.hash(datos.password, 10);
    await usuarioModel.actualizarPassword(idUsuario, hash);
  }

  if (rol.nombre_rol === 'TECNICO') {
    const perfil = await tecnicoModel.obtenerPorUsuario(idUsuario);
    if (!perfil) {
      const porcentaje = validarPorcentaje(datos.porcentaje_mano_obra);
      await tecnicoModel.crear({
        id_usuario: idUsuario,
        porcentaje_mano_obra: porcentaje,
        activo: 1,
      });
    }
  }

  return obtenerPorId(idUsuario);
}

async function cambiarEstado(idUsuario, activo) {
  const actual = await usuarioModel.obtenerPorId(idUsuario);
  if (!actual) throw new Error('Usuario no encontrado');
  await usuarioModel.cambiarEstado(idUsuario, Number(activo));
  await tecnicoModel.cambiarEstadoPorUsuario(idUsuario, Number(activo));
  return obtenerPorId(idUsuario);
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
