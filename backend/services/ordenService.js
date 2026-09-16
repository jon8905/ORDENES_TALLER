const ordenModel = require('../models/OrdenTrabajo');
const motocicletaModel = require('../models/Motocicleta');
const tecnicoModel = require('../models/Tecnico');
const reporteModel = require('../models/ReporteTecnico');
const ordenRepuestoModel = require('../models/OrdenRepuesto');
const { campoObligatorio, validarEstadoOrden } = require('../utils/validaciones');

async function enriquecer(orden) {
  if (!orden) return null;
  const tecnicos = await ordenModel.tecnicosDeOrden(orden.id_orden);
  const ultimoReporte = await reporteModel.ultimoPorOrden(orden.id_orden);
  const repuestos = await ordenRepuestoModel.listarPorOrden(orden.id_orden);
  return {
    ...orden,
    tecnicos,
    tipo_reparacion: ultimoReporte ? ultimoReporte.tipo_reparacion : null,
    repuestos,
  };
}

async function listar(usuario) {
  let ordenes;
  if (usuario.rol === 'TECNICO') {
    ordenes = await ordenModel.listarPorTecnico(usuario.id_tecnico);
  } else if (usuario.rol === 'JEFE_TALLER') {
    ordenes = await ordenModel.listarActivas();
  } else {
    ordenes = await ordenModel.listar();
  }
  return Promise.all(ordenes.map(enriquecer));
}

async function obtenerPorId(idOrden, usuario) {
  const orden = await ordenModel.obtenerPorId(idOrden);
  if (!orden) throw new Error('Orden de trabajo no encontrada');

  if (usuario.rol === 'TECNICO') {
    const asignado = await ordenModel.tecnicoAsignado(idOrden, usuario.id_tecnico);
    if (!asignado) throw new Error('No tiene acceso a esta orden');
  }

  return enriquecer(orden);
}

async function crear(datos) {
  campoObligatorio(datos.id_motocicleta, 'id_motocicleta');
  campoObligatorio(datos.descripcion_problema, 'descripcion_problema');

  const moto = await motocicletaModel.obtenerPorId(datos.id_motocicleta);
  if (!moto) throw new Error('La motocicleta no existe');

  const id = await ordenModel.crear({
    id_motocicleta: datos.id_motocicleta,
    fecha_ingreso: datos.fecha_ingreso || new Date(),
    descripcion_problema: datos.descripcion_problema.trim(),
    observaciones_ingreso: datos.observaciones_ingreso || null,
    estado: 'RECIBIDA',
  });
  return enriquecer(await ordenModel.obtenerPorId(id));
}

async function actualizar(idOrden, datos) {
  const orden = await ordenModel.obtenerPorId(idOrden);
  if (!orden) throw new Error('Orden de trabajo no encontrada');
  campoObligatorio(datos.descripcion_problema, 'descripcion_problema');
  await ordenModel.actualizar(idOrden, {
    descripcion_problema: datos.descripcion_problema.trim(),
    observaciones_ingreso: datos.observaciones_ingreso || null,
  });
  return enriquecer(await ordenModel.obtenerPorId(idOrden));
}

async function cambiarEstado(idOrden, estado, usuario) {
  const orden = await obtenerPorId(idOrden, usuario);
  const nuevoEstado = validarEstadoOrden(estado, usuario.rol);
  const fechaSalida = ['ENTREGADA', 'CANCELADA'].includes(nuevoEstado)
    ? new Date()
    : null;
  await ordenModel.cambiarEstado(idOrden, nuevoEstado, fechaSalida);
  return enriquecer(await ordenModel.obtenerPorId(idOrden));
}

async function asignarTecnico(idOrden, idTecnico, usuario) {
  const orden = await ordenModel.obtenerPorId(idOrden);
  if (!orden) throw new Error('Orden de trabajo no encontrada');

  const tecnico = await tecnicoModel.obtenerPorId(idTecnico);
  if (!tecnico || !tecnico.activo) {
    throw new Error('El técnico no existe o está inactivo');
  }

  await ordenModel.asignarTecnico({
    id_orden: idOrden,
    id_tecnico: idTecnico,
    asignado_por: usuario.id_usuario,
  });

  if (orden.estado === 'RECIBIDA') {
    await ordenModel.cambiarEstado(idOrden, 'ASIGNADA', null);
  }

  return enriquecer(await ordenModel.obtenerPorId(idOrden));
}

async function listarRepuestos(idOrden, usuario) {
  await obtenerPorId(idOrden, usuario);
  return ordenRepuestoModel.listarPorOrden(idOrden);
}

async function agregarRepuesto(idOrden, datos, usuario) {
  await obtenerPorId(idOrden, usuario);
  campoObligatorio(datos.nombre, 'nombre');
  campoObligatorio(datos.costo, 'costo');

  const cantidad = Number(datos.cantidad || 1);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error('La cantidad debe ser un entero positivo');
  }
  const costoUnitario = Number(datos.costo);
  if (Number.isNaN(costoUnitario) || costoUnitario < 0) {
    throw new Error('El costo debe ser un valor positivo o cero');
  }

  await ordenRepuestoModel.crear({
    id_orden: idOrden,
    nombre: String(datos.nombre).trim(),
    cantidad,
    costo_unitario: costoUnitario,
    costo_total: Number((costoUnitario * cantidad).toFixed(2)),
  });

  return ordenRepuestoModel.listarPorOrden(idOrden);
}

async function eliminarRepuesto(idOrden, idOrdenRepuesto, usuario) {
  await obtenerPorId(idOrden, usuario);
  const ok = await ordenRepuestoModel.eliminar(idOrdenRepuesto, idOrden);
  if (!ok) throw new Error('Repuesto no encontrado en esta orden');
  return ordenRepuestoModel.listarPorOrden(idOrden);
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  asignarTecnico,
  listarRepuestos,
  agregarRepuesto,
  eliminarRepuesto,
};
