const clienteModel = require('../models/Cliente');
const motocicletaModel = require('../models/Motocicleta');
const motocicletaService = require('./motocicletaService');
const { campoObligatorio } = require('../utils/validaciones');

async function conMotocicletas(cliente) {
  if (!cliente) return null;
  const motocicletas = await motocicletaModel.listarPorCliente(cliente.id_cliente);
  return { ...cliente, motocicletas };
}

async function listar() {
  const clientes = await clienteModel.listar();
  return Promise.all(clientes.map(conMotocicletas));
}

async function obtenerPorId(idCliente) {
  const cliente = await clienteModel.obtenerPorId(idCliente);
  if (!cliente) throw new Error('Cliente no encontrado');
  return conMotocicletas(cliente);
}

function validarDatos(datos) {
  campoObligatorio(datos.nombre, 'nombre');
  campoObligatorio(datos.apellido, 'apellido');
  campoObligatorio(datos.documento, 'documento');
  campoObligatorio(datos.telefono, 'telefono');
}

async function crear(datos) {
  validarDatos(datos);
  if (await clienteModel.existeDocumento(datos.documento)) {
    throw new Error('El documento del cliente ya está registrado');
  }
  const idCliente = await clienteModel.crear({
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    documento: String(datos.documento).trim(),
    direccion: datos.direccion || null,
    telefono: datos.telefono.trim(),
    telefono_secundario: datos.telefono_secundario || null,
    email: datos.email || null,
  });

  const placa = datos.placa && String(datos.placa).trim();
  if (placa) {
    await motocicletaService.crear({
      placa,
      marca: datos.marca,
      modelo: datos.modelo,
      color: datos.color,
      id_cliente: idCliente,
    });
  }

  return obtenerPorId(idCliente);
}

async function actualizar(idCliente, datos) {
  await obtenerPorId(idCliente);
  validarDatos(datos);
  if (await clienteModel.existeDocumento(datos.documento, idCliente)) {
    throw new Error('El documento del cliente ya está registrado');
  }
  await clienteModel.actualizar(idCliente, {
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    documento: String(datos.documento).trim(),
    direccion: datos.direccion || null,
    telefono: datos.telefono.trim(),
    telefono_secundario: datos.telefono_secundario || null,
    email: datos.email || null,
  });
  return obtenerPorId(idCliente);
}

async function eliminar(idCliente) {
  await obtenerPorId(idCliente);
  if (await clienteModel.tieneMotocicletas(idCliente)) {
    throw new Error('No se puede eliminar el cliente porque tiene motocicletas registradas');
  }
  await clienteModel.eliminar(idCliente);
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
