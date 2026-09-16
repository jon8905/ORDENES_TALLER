const historialModel = require('../models/Historial');
const { campoObligatorio, normalizarPlaca } = require('../utils/validaciones');

async function buscarPorPlaca(placa) {
  campoObligatorio(placa, 'placa');
  const historial = await historialModel.buscarPorPlaca(normalizarPlaca(placa));
  if (!historial) throw new Error('No se encontró una motocicleta con esa placa');
  return historial;
}

module.exports = { buscarPorPlaca };
