const repuestoModel = require('../models/Repuesto');
const { campoObligatorio } = require('../utils/validaciones');

async function listar() {
  return repuestoModel.listar();
}

async function obtenerPorId(idRepuesto) {
  const item = await repuestoModel.obtenerPorId(idRepuesto);
  if (!item) throw new Error('Repuesto no encontrado');
  return item;
}

async function crear(datos) {
  campoObligatorio(datos.marca, 'marca');
  campoObligatorio(datos.nombre, 'nombre');
  const costo = Number(datos.costo || 0);
  if (Number.isNaN(costo) || costo < 0) {
    throw new Error('El costo debe ser un valor positivo');
  }
  const id = await repuestoModel.crear({
    marca: datos.marca.trim(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion || null,
    costo,
  });
  return obtenerPorId(id);
}

async function actualizar(idRepuesto, datos) {
  await obtenerPorId(idRepuesto);
  campoObligatorio(datos.marca, 'marca');
  campoObligatorio(datos.nombre, 'nombre');
  const costo = Number(datos.costo || 0);
  if (Number.isNaN(costo) || costo < 0) {
    throw new Error('El costo debe ser un valor positivo');
  }
  await repuestoModel.actualizar(idRepuesto, {
    marca: datos.marca.trim(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion || null,
    costo,
  });
  return obtenerPorId(idRepuesto);
}

async function eliminar(idRepuesto) {
  await obtenerPorId(idRepuesto);
  try {
    await repuestoModel.eliminar(idRepuesto);
  } catch (err) {
    throw new Error('No se puede eliminar el repuesto porque está asociado a un reporte');
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
