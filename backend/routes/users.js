const express = require('express');
const router = express.Router();
const { authenticateUserToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');

// Obtener datos del usuario autenticado (requiere sesión)
router.get('/me', authenticateUserToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role
    }
  });
});

// Actualizar perfil del usuario
router.put('/profile', authenticateUserToken, async (req, res) => {
  try {
    console.log('🔧 Actualizando perfil para usuario:', req.user.id);
    console.log('📝 Datos recibidos:', req.body);
    
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y teléfono son campos obligatorios' 
      });
    }

    // Verificar que el email no esté en uso por otro usuario
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está en uso por otro usuario' 
      });
    }

    // Si se va a cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Debes proporcionar tu contraseña actual' 
        });
      }

      // Verificar contraseña actual
      const user = await query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (user.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'La contraseña actual es incorrecta' 
        });
      }

      // Hashear nueva contraseña
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar usuario con nueva contraseña
      await query(
        'UPDATE users SET email = $1, phone = $2, password = $3, updated_at = NOW() WHERE id = $4',
        [email, phone, hashedNewPassword, userId]
      );
    } else {
      // Actualizar usuario sin cambiar contraseña
      await query(
        'UPDATE users SET email = $1, phone = $2, updated_at = NOW() WHERE id = $3',
        [email, phone, userId]
      );
    }

    // Obtener usuario actualizado
    const updatedUser = await query(
      'SELECT id, name, email, phone, role FROM users WHERE id = $1',
      [userId]
    );

    console.log('✅ Perfil actualizado exitosamente para usuario:', userId);
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;