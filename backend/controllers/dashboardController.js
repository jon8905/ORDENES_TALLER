const dashboardService = require('../services/dashboardService');
const { exito, error } = require('../utils/respuestas');

async function obtener(req, res) {
  try {
    return exito(res, await dashboardService.obtener(req.usuario));
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { obtener };
