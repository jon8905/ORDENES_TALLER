const express = require('express');
const ordenController = require('../controllers/ordenController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken);

router.get('/', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.listar);
router.get('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.obtener);
router.post('/', autorizarRoles('ADMIN', 'JEFE_TALLER'), ordenController.crear);
router.put('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER'), ordenController.actualizar);
router.patch('/:id/estado', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.cambiarEstado);
router.post('/:id/asignar', autorizarRoles('ADMIN', 'JEFE_TALLER'), ordenController.asignar);
router.get('/:id/repuestos', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.listarRepuestos);
router.post('/:id/repuestos', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.agregarRepuesto);
router.delete('/:id/repuestos/:idRepuesto', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), ordenController.eliminarRepuesto);

module.exports = router;
