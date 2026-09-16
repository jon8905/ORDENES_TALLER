const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, dashboardController.obtener);

module.exports = router;
