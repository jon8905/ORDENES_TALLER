const reporteModel = require('../models/ReporteTecnico');
const repuestoModel = require('../models/Repuesto');
const ordenModel = require('../models/OrdenTrabajo');
const { campoObligatorio, validarMonto, normalizarPlaca } = require('../utils/validaciones');

async function listar(usuario, filtros = {}) {
  const consulta = { ...filtros };
  if (usuario.rol === 'TECNICO') {
    consulta.id_tecnico = usuario.id_tecnico;
    consulta.ocultar_entregadas = true;
    delete consulta.placa;
  } else if (consulta.placa) {
    consulta.placa = normalizarPlaca(consulta.placa);
  }
  return reporteModel.listar(consulta);
}

async function obtenerPorId(idReporte, usuario) {
  const reporte = await reporteModel.obtenerPorId(idReporte);
  if (!reporte) throw new Error('Reporte técnico no encontrado');
  if (usuario.rol === 'TECNICO' && reporte.id_tecnico !== usuario.id_tecnico) {
    throw new Error('No tiene acceso a este reporte');
  }
  reporte.repuestos = await repuestoModel.listarPorReporte(idReporte);
  return reporte;
}

async function crear(datos, usuario) {
  campoObligatorio(datos.id_orden, 'id_orden');
  campoObligatorio(datos.diagnostico, 'diagnostico');
  campoObligatorio(datos.tipo_reparacion, 'tipo_reparacion');
  campoObligatorio(datos.descripcion_trabajo, 'descripcion_trabajo');

  const idTecnico = usuario.rol === 'TECNICO' ? usuario.id_tecnico : datos.id_tecnico;
  if (!idTecnico) throw new Error('Debe indicar el técnico del reporte');

  const asignado = await ordenModel.tecnicoAsignado(datos.id_orden, idTecnico);
  if (!asignado && usuario.rol === 'TECNICO') {
    throw new Error('El técnico no está asignado a esta orden');
  }

  const id = await reporteModel.crear({
    id_orden: datos.id_orden,
    id_tecnico: idTecnico,
    diagnostico: datos.diagnostico.trim(),
    tipo_reparacion: datos.tipo_reparacion.trim(),
    descripcion_trabajo: datos.descripcion_trabajo.trim(),
    recomendaciones: datos.recomendaciones || null,
  });
  return obtenerPorId(id, usuario);
}

async function agregarRepuesto(idReporte, datos, usuario) {
  await obtenerPorId(idReporte, usuario);
  campoObligatorio(datos.id_repuesto, 'id_repuesto');
  campoObligatorio(datos.cantidad, 'cantidad');

  const cantidad = Number(datos.cantidad);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error('La cantidad debe ser un entero positivo');
  }

  const catalogo = await repuestoModel.obtenerPorId(datos.id_repuesto);
  if (!catalogo) throw new Error('El repuesto no existe');

  const costoUnitario = datos.costo_unitario
    ? validarMonto(datos.costo_unitario, 'costo unitario')
    : Number(catalogo.costo);

  await repuestoModel.agregarAReporte({
    id_reporte: idReporte,
    id_repuesto: datos.id_repuesto,
    cantidad,
    costo_unitario: costoUnitario,
    costo_total: Number((costoUnitario * cantidad).toFixed(2)),
  });

  return obtenerPorId(idReporte, usuario);
}

module.exports = { listar, obtenerPorId, crear, agregarRepuesto };
