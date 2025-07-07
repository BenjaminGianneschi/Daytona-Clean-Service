const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Registrar usuario
router.post('/register', userController.register);

// Login de usuario
router.post('/login', userController.login);

// Obtener historial de turnos del usuario autenticado (requiere sesión)
router.get('/appointments', userController.getAppointments);

module.exports = router; 