const reporteService = require('../services/reporteService');
const { generarPdfReporte } = require('../utils/pdfReporte');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await reporteService.listar(req.usuario, req.query));
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await reporteService.obtenerPorId(req.params.id, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await reporteService.crear(req.body, req.usuario), 'Reporte técnico creado', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function agregarRepuesto(req, res) {
  try {
    return exito(
      res,
      await reporteService.agregarRepuesto(req.params.id, req.body, req.usuario),
      'Repuesto agregado'
    );
  } catch (err) {
    return error(res, err.message);
  }
}

async function pdf(req, res) {
  try {
    const reporte = await reporteService.obtenerPorId(req.params.id, req.usuario);
    generarPdfReporte(reporte, res);
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, crear, agregarRepuesto, pdf };
