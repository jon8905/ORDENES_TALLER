const express = require('express');
const repuestoController = require('../controllers/repuestoController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken, autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'));

router.get('/', repuestoController.listar);
router.get('/:id', repuestoController.obtener);
router.post('/', autorizarRoles('ADMIN', 'JEFE_TALLER'), repuestoController.crear);
router.put('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER'), repuestoController.actualizar);
router.delete('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER'), repuestoController.eliminar);

module.exports = router;
