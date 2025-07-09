const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

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

// Ruta para probar JWT (temporal, solo para debug)
router.post('/test-jwt', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar credenciales
    const users = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
    
    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Verificar token inmediatamente
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        success: true,
        message: 'JWT funcionando correctamente',
        token,
        decoded,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      });
    } catch (jwtError) {
      res.json({
        success: false,
        message: 'Error verificando JWT',
        error: jwtError.message,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      });
    }
    
  } catch (error) {
    console.error('Error en test JWT:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta temporal para crear el primer admin (solo usar una vez)
router.post('/create-first-admin', async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    
    // Verificar clave secreta (cambiar esto por una clave segura)
    if (secretKey !== 'daytona2024') {
      return res.status(403).json({
        success: false,
        message: 'Clave secreta incorrecta'
      });
    }
    
    // Verificar si ya existe un admin
    const existingAdmin = await query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['admin']
    );
    
    if (parseInt(existingAdmin[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador. Esta ruta solo es para crear el primer admin.'
      });
    }
    
    // Verificar si existe el usuario
    const existingUser = await query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = existingUser[0];
    
    // Actualizar rol a admin
    await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2',
      ['admin', email]
    );
    
    res.json({
      success: true,
      message: 'Primer administrador creado exitosamente',
      user: {
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('Error creando primer admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para hacer admin a un usuario (solo para admins)
router.post('/make-admin', auth, async (req, res) => {
  try {
    // Verificar que el usuario que hace la petición sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden promover usuarios.'
      });
    }

    const { email } = req.body;
    
    // Verificar si existe el usuario
    const existingUser = await query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = existingUser[0];
    
    // No permitir que un admin se haga admin a sí mismo (redundante)
    if (user.email === req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol'
      });
    }
    
    // Actualizar rol a admin
    await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE email = $2',
      ['admin', email]
    );
    
    res.json({
      success: true,
      message: 'Usuario promovido a administrador exitosamente',
      user: {
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('Error promoviendo usuario a admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;