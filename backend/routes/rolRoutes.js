const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.get('/', authenticateToken, autorizarRoles('ADMIN'), usuarioController.listarRoles);

module.exports = router;
