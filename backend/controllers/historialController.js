const historialService = require('../services/historialService');
const { exito, error } = require('../utils/respuestas');

async function buscar(req, res) {
  try {
    return exito(res, await historialService.buscarPorPlaca(req.query.placa));
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { buscar };
