const express = require('express');
const reporteController = require('../controllers/reporteController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken);

router.get('/', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), reporteController.listar);
router.get('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), reporteController.obtener);
router.get('/:id/pdf', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), reporteController.pdf);
router.post('/', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), reporteController.crear);
router.post('/:id/repuestos', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), reporteController.agregarRepuesto);

module.exports = router;
