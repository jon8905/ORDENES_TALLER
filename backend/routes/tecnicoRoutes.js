const express = require('express');
const tecnicoController = require('../controllers/tecnicoController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken);

router.get('/', autorizarRoles('ADMIN', 'JEFE_TALLER'), tecnicoController.listar);
router.get('/:id/totales', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), tecnicoController.totales);
router.get('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER'), tecnicoController.obtener);
router.patch('/:id/porcentaje', autorizarRoles('ADMIN'), tecnicoController.actualizarPorcentaje);

module.exports = router;
