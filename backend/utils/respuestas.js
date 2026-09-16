function exito(res, datos = null, mensaje = 'Operación exitosa', codigo = 200) {
  return res.status(codigo).json({ exito: true, mensaje, datos });
}

function error(res, mensaje = 'Error en la solicitud', codigo = 400) {
  return res.status(codigo).json({ exito: false, mensaje, datos: null });
}

function noEncontrado(res, mensaje = 'Registro no encontrado') {
  return error(res, mensaje, 404);
}

function noAutorizado(res, mensaje = 'No autorizado') {
  return error(res, mensaje, 401);
}

function prohibido(res, mensaje = 'No tiene permisos para esta acción') {
  return error(res, mensaje, 403);
}

module.exports = { exito, error, noEncontrado, noAutorizado, prohibido };
