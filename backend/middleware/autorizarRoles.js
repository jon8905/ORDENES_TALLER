const { prohibido } = require('../utils/respuestas');

function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return prohibido(res, 'No tiene permisos para este módulo');
    }
    return next();
  };
}

module.exports = autorizarRoles;
