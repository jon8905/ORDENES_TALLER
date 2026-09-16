const express = require('express');
const liquidacionController = require('../controllers/liquidacionController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken);

router.get('/', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), liquidacionController.listar);
router.get('/calcular', autorizarRoles('ADMIN', 'JEFE_TALLER'), liquidacionController.calcular);
router.get('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), liquidacionController.obtener);
router.get('/:id/pdf', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), liquidacionController.pdf);
router.post('/', autorizarRoles('ADMIN', 'JEFE_TALLER'), liquidacionController.crear);
router.patch('/:id/pagar', autorizarRoles('ADMIN', 'JEFE_TALLER'), liquidacionController.pagar);

module.exports = router;
