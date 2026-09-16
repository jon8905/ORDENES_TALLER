const manoObraModel = require('../models/ManoObra');
const ordenModel = require('../models/OrdenTrabajo');
const tecnicoService = require('./tecnicoService');
const { campoObligatorio, validarMonto } = require('../utils/validaciones');

async function listar(usuario, filtros = {}) {
  if (usuario.rol === 'TECNICO') {
    filtros.id_tecnico = usuario.id_tecnico;
    filtros.ocultar_entregadas = true;
  }
  return manoObraModel.listar(filtros);
}

async function obtenerPorId(idManoObra, usuario) {
  const registro = await manoObraModel.obtenerPorId(idManoObra);
  if (!registro) throw new Error('Registro de mano de obra no encontrado');
  if (usuario.rol === 'TECNICO' && registro.id_tecnico !== usuario.id_tecnico) {
    throw new Error('No tiene acceso a este registro');
  }
  return registro;
}

async function crear(datos, usuario) {
  if (usuario.rol !== 'TECNICO' && usuario.rol !== 'ADMIN') {
    throw new Error('Solo el técnico puede registrar mano de obra');
  }
  if (!usuario.id_tecnico && usuario.rol === 'TECNICO') {
    throw new Error('El usuario no tiene perfil de técnico');
  }

  campoObligatorio(datos.id_orden, 'id_orden');
  campoObligatorio(datos.descripcion, 'descripcion');
  const valor = validarMonto(datos.valor_mano_obra, 'valor de mano de obra');

  const idTecnico = usuario.rol === 'TECNICO' ? usuario.id_tecnico : datos.id_tecnico;
  const asignado = await ordenModel.tecnicoAsignado(datos.id_orden, idTecnico);
  if (!asignado) {
    throw new Error('El técnico no está asignado a esta orden');
  }

  const id = await manoObraModel.crear({
    id_orden: datos.id_orden,
    id_tecnico: idTecnico,
    descripcion: datos.descripcion.trim(),
    valor_mano_obra: valor,
  });
  return manoObraModel.obtenerPorId(id);
}

async function decidir(idManoObra, accion, datos, usuario) {
  if (!['JEFE_TALLER', 'ADMIN'].includes(usuario.rol)) {
    throw new Error('No tiene permisos para aprobar mano de obra');
  }

  const registro = await manoObraModel.obtenerPorId(idManoObra);
  if (!registro) throw new Error('No se puede aprobar una mano de obra inexistente');

  if (registro.id_tecnico && usuario.id_tecnico === registro.id_tecnico) {
    throw new Error('Un técnico no puede aprobar su propia mano de obra');
  }

  if (registro.estado_aprobacion !== 'PENDIENTE') {
    throw new Error('Solo se pueden gestionar registros en estado PENDIENTE');
  }

  let estado = 'APROBADA';
  let valorAprobado = Number(registro.valor_mano_obra);
  let observaciones = datos.observaciones_jefe || null;

  if (accion === 'aprobar') {
    estado = 'APROBADA';
  } else if (accion === 'modificar') {
    valorAprobado = validarMonto(datos.valor_aprobado, 'valor aprobado');
    campoObligatorio(datos.observaciones_jefe, 'observaciones_jefe');
    estado = 'MODIFICADA';
    observaciones = datos.observaciones_jefe;
  } else if (accion === 'rechazar') {
    campoObligatorio(datos.observaciones_jefe, 'observaciones_jefe');
    estado = 'RECHAZADA';
    valorAprobado = null;
    observaciones = datos.observaciones_jefe;
  } else {
    throw new Error('Acción no válida');
  }

  await manoObraModel.actualizarAprobacion(idManoObra, {
    estado_aprobacion: estado,
    valor_aprobado: valorAprobado,
    aprobado_por: usuario.id_usuario,
    fecha_aprobacion: new Date(),
    observaciones_jefe: observaciones,
  });

  return manoObraModel.obtenerPorId(idManoObra);
}

async function totales(idTecnico, usuario) {
  if (usuario.rol === 'TECNICO' && Number(idTecnico) !== Number(usuario.id_tecnico)) {
    throw new Error('No puede consultar totales de otro técnico');
  }
  return tecnicoService.totales(idTecnico);
}

module.exports = { listar, obtenerPorId, crear, decidir, totales };
