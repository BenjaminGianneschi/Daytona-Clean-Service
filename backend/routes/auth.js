const express = require('express');
const router = express.Router();
const { login, verifyToken, changePassword, createAdmin } = require('../controllers/authController');
const { authenticateToken, authenticateUserToken, requireSuperAdmin } = require('../middleware/auth');

// Rutas públicas
router.post('/login', login);

// Rutas protegidas (administradores)
router.get('/verify', authenticateToken, verifyToken);
router.put('/change-password', authenticateToken, changePassword);
router.post('/create-admin', authenticateToken, requireSuperAdmin, createAdmin);

// Rutas protegidas (usuarios regulares)
router.get('/verify-user', authenticateUserToken, verifyToken);

module.exports = router; 