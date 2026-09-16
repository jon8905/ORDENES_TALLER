const express = require('express');
const manoObraController = require('../controllers/manoObraController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken);

router.get('/', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), manoObraController.listar);
router.get('/totales/:idTecnico', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), manoObraController.totales);
router.get('/:id', autorizarRoles('ADMIN', 'JEFE_TALLER', 'TECNICO'), manoObraController.obtener);
router.post('/', autorizarRoles('ADMIN', 'TECNICO'), manoObraController.crear);
router.patch('/:id/aprobar', autorizarRoles('ADMIN', 'JEFE_TALLER'), manoObraController.aprobar);
router.patch('/:id/modificar', autorizarRoles('ADMIN', 'JEFE_TALLER'), manoObraController.modificar);
router.patch('/:id/rechazar', autorizarRoles('ADMIN', 'JEFE_TALLER'), manoObraController.rechazar);

module.exports = router;
