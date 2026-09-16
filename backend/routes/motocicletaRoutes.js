const express = require('express');
const motocicletaController = require('../controllers/motocicletaController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken, autorizarRoles('ADMIN', 'JEFE_TALLER'));

router.get('/', motocicletaController.listar);
router.get('/:id', motocicletaController.obtener);
router.post('/', motocicletaController.crear);
router.put('/:id', motocicletaController.actualizar);
router.delete('/:id', motocicletaController.eliminar);

module.exports = router;
