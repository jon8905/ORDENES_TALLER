const motocicletaModel = require('../models/Motocicleta');
const clienteModel = require('../models/Cliente');
const { campoObligatorio, normalizarPlaca } = require('../utils/validaciones');

async function listar() {
  return motocicletaModel.listar();
}

async function obtenerPorId(idMotocicleta) {
  const moto = await motocicletaModel.obtenerPorId(idMotocicleta);
  if (!moto) throw new Error('Motocicleta no encontrada');
  return moto;
}

async function listarPorCliente(idCliente) {
  return motocicletaModel.listarPorCliente(idCliente);
}

async function buscarPorPlaca(placa) {
  campoObligatorio(placa, 'placa');
  const moto = await motocicletaModel.obtenerPorPlaca(normalizarPlaca(placa));
  if (!moto) throw new Error('No hay una motocicleta registrada con esa placa');
  return moto;
}

function validarDatos(datos) {
  campoObligatorio(datos.placa, 'placa');
  campoObligatorio(datos.marca, 'marca');
  campoObligatorio(datos.modelo, 'modelo');
  campoObligatorio(datos.color, 'color');
  campoObligatorio(datos.id_cliente, 'id_cliente');
}

async function crear(datos) {
  validarDatos(datos);
  const placa = normalizarPlaca(datos.placa);
  if (await motocicletaModel.existePlaca(placa)) {
    throw new Error('La placa ya está registrada');
  }
  const cliente = await clienteModel.obtenerPorId(datos.id_cliente);
  if (!cliente) throw new Error('El cliente no existe');

  const id = await motocicletaModel.crear({
    placa,
    marca: datos.marca.trim(),
    modelo: datos.modelo.trim(),
    color: datos.color.trim(),
    id_cliente: datos.id_cliente,
  });
  return obtenerPorId(id);
}

async function actualizar(idMotocicleta, datos) {
  await obtenerPorId(idMotocicleta);
  validarDatos(datos);
  const placa = normalizarPlaca(datos.placa);
  if (await motocicletaModel.existePlaca(placa, idMotocicleta)) {
    throw new Error('La placa ya está registrada');
  }
  const cliente = await clienteModel.obtenerPorId(datos.id_cliente);
  if (!cliente) throw new Error('El cliente no existe');

  await motocicletaModel.actualizar(idMotocicleta, {
    placa,
    marca: datos.marca.trim(),
    modelo: datos.modelo.trim(),
    color: datos.color.trim(),
    id_cliente: datos.id_cliente,
  });
  return obtenerPorId(idMotocicleta);
}

async function eliminar(idMotocicleta) {
  await obtenerPorId(idMotocicleta);
  if (await motocicletaModel.tieneOrdenes(idMotocicleta)) {
    throw new Error('No se puede eliminar la motocicleta porque tiene órdenes de trabajo');
  }
  await motocicletaModel.eliminar(idMotocicleta);
}

module.exports = { listar, obtenerPorId, listarPorCliente, buscarPorPlaca, crear, actualizar, eliminar };
