const express = require('express');
const clienteController = require('../controllers/clienteController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken, autorizarRoles('ADMIN', 'JEFE_TALLER'));

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.delete('/:id', clienteController.eliminar);

module.exports = router;
