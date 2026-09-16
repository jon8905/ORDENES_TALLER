const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.use(authenticateToken, autorizarRoles('ADMIN'));

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtener);
router.post('/', usuarioController.crear);
router.put('/:id', usuarioController.actualizar);
router.patch('/:id/estado', usuarioController.cambiarEstado);

module.exports = router;
