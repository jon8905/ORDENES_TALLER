const express = require('express');
const historialController = require('../controllers/historialController');
const authenticateToken = require('../middleware/authenticateToken');
const autorizarRoles = require('../middleware/autorizarRoles');

const router = express.Router();

router.get('/', authenticateToken, autorizarRoles('ADMIN', 'JEFE_TALLER'), historialController.buscar);

module.exports = router;
