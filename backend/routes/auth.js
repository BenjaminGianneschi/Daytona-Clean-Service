const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');

// Rutas públicas para usuarios
router.post('/login', login);
router.post('/register', register);

// Ruta para resetear contraseña (temporal, solo para desarrollo)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Verificar si existe el usuario
    const existingUser = await query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = existingUser[0];
    
    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar la contraseña
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email]
    );
    
    res.json({
      success: true,
      message: 'Contraseña reseteada exitosamente',
      user: {
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;