const dashboardModel = require('../models/Dashboard');
const tecnicoService = require('./tecnicoService');

async function obtener(usuario) {
  if (usuario.rol === 'ADMIN') {
    return { tipo: 'ADMIN', ...await dashboardModel.admin() };
  }
  if (usuario.rol === 'JEFE_TALLER') {
    return { tipo: 'JEFE_TALLER', ...await dashboardModel.jefe() };
  }
  const base = await dashboardModel.tecnico(usuario.id_tecnico);
  const totales = usuario.id_tecnico
    ? await tecnicoService.totales(usuario.id_tecnico)
    : null;
  return { tipo: 'TECNICO', ...base, totales };
}

module.exports = { obtener };
