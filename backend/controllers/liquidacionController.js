const liquidacionService = require('../services/liquidacionService');
const { generarPdfLiquidacion } = require('../utils/pdfLiquidacion');
const { exito, error } = require('../utils/respuestas');

async function listar(req, res) {
  try {
    return exito(res, await liquidacionService.listar(req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function obtener(req, res) {
  try {
    return exito(res, await liquidacionService.obtenerPorId(req.params.id, req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

async function calcular(req, res) {
  try {
    return exito(
      res,
      await liquidacionService.calcular(req.query.id_tecnico, req.query.fecha_inicio, req.query.fecha_fin)
    );
  } catch (err) {
    return error(res, err.message);
  }
}

async function crear(req, res) {
  try {
    return exito(res, await liquidacionService.crear(req.body, req.usuario), 'Liquidación generada', 201);
  } catch (err) {
    return error(res, err.message);
  }
}

async function pagar(req, res) {
  try {
    return exito(res, await liquidacionService.marcarPagada(req.params.id, req.usuario), 'Liquidación marcada como pagada');
  } catch (err) {
    return error(res, err.message);
  }
}

async function pdf(req, res) {
  try {
    const liquidacion = await liquidacionService.obtenerPorId(req.params.id, req.usuario);
    generarPdfLiquidacion(liquidacion, res);
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { listar, obtener, calcular, crear, pagar, pdf };
