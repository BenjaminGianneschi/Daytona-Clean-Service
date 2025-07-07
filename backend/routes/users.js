const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const router = express.Router();

// Registrar usuario (opcional durante el turno)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validar datos requeridos
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }
    
    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    // Verificar si el teléfono ya existe
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );
    
    if (existingPhone.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El teléfono ya está registrado' 
      });
    }
    
    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Crear usuario - usando 'password' en lugar de 'password_hash'
    const result = await query(
      'INSERT INTO users (name, email, phone, password, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [name, email, phone, passwordHash]
    );
    
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result[0].id
    });
    
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email - usando 'password' en lugar de 'password_hash'
    const users = await query(
      'SELECT id, name, email, phone, password FROM users WHERE email = $1',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      });
    }
    
    // Crear sesión simple (en producción usar JWT)
    req.session.userId = user.id;
    req.session.userName = user.name;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Endpoint de debug para verificar autenticación
router.get('/debug-auth', async (req, res) => {
  try {
    console.log('🔍 Debug de autenticación:');
    console.log('Headers:', req.headers);
    console.log('Session:', req.session);
    
    // Verificar token JWT
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token JWT válido:', decoded);
        
        // Verificar usuario
        const user = await query(
          'SELECT id, name, email FROM users WHERE id = ?',
          [decoded.userId]
        );
        
        if (user.length > 0) {
          return res.json({
            success: true,
            authType: 'JWT',
            user: user[0],
            message: 'Usuario autenticado con JWT'
          });
        }
      } catch (jwtError) {
        console.log('❌ Error JWT:', jwtError.message);
      }
    }
    
    // Verificar sesión
    if (req.session && req.session.userId) {
      console.log('✅ Sesión válida:', req.session);
      
      const user = await query(
        'SELECT id, name, email FROM users WHERE id = ?',
        [req.session.userId]
      );
      
      if (user.length > 0) {
        return res.json({
          success: true,
          authType: 'Session',
          user: user[0],
          message: 'Usuario autenticado con sesión'
        });
      }
    }
    
    return res.status(401).json({
      success: false,
      authType: 'None',
      message: 'No hay autenticación válida',
      hasToken: !!token,
      hasSession: !!(req.session && req.session.userId)
    });
    
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({
      success: false,
      message: 'Error en debug',
      error: error.message
    });
  }
});

// Obtener historial de turnos del usuario
router.get('/appointments', async (req, res) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // Verificar token JWT
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe
    const user = await query(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    const userId = user[0].id;
    
    const appointments = await query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.start_time,
        a.status,
        a.total_amount,
        a.notes,
        sl.address,
        GROUP_CONCAT(CONCAT(s.name, ' x', as.quantity) SEPARATOR ', ') as services
      FROM appointments a
      LEFT JOIN service_locations sl ON a.id = sl.appointment_id
      LEFT JOIN appointment_services as ON a.id = as.appointment_id
      LEFT JOIN services s ON as.service_id = s.id
      WHERE a.user_id = ?
      GROUP BY a.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `, [userId]);
    
    res.json({
      success: true,
      appointments: appointments
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Cancelar turno (solo usuarios registrados)
router.post('/appointments/:id/cancel', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const appointmentId = req.params.id;
    
    // Verificar que el turno pertenece al usuario
    const appointment = await query(`
      SELECT a.id, a.status 
      FROM appointments a
      WHERE a.id = $1 AND a.user_id = $2
    `, [appointmentId, req.session.userId]);
    
    if (appointment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Turno no encontrado' 
      });
    }
    
    if (appointment[0].status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'El turno ya está cancelado' 
      });
    }
    
    // Cancelar turno
    await query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', appointmentId]
    );
    
    res.json({
      success: true,
      message: 'Turno cancelado exitosamente'
    });
    
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener perfil del usuario
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const users = await query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar perfil del usuario
router.put('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const { name, phone } = req.body;
    
    // Validar datos
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y teléfono son requeridos' 
      });
    }
    
    // Verificar si el teléfono ya existe en otro usuario
    const existingPhone = await query(
      'SELECT id FROM users WHERE phone = $1 AND id != $2',
      [phone, req.session.userId]
    );
    
    if (existingPhone.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El teléfono ya está registrado por otro usuario' 
      });
    }
    
    // Actualizar usuario
    await query(
      'UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3',
      [name, phone, req.session.userId]
    );
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Cambiar contraseña
router.put('/change-password', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Validar datos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Obtener contraseña actual - usando 'password' en lugar de 'password_hash'
    const users = await query(
      'SELECT password FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!passwordMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña actual es incorrecta' 
      });
    }
    
    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar contraseña - usando 'password' en lugar de 'password_hash'
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.session.userId]
    );
    
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error en logout:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al cerrar sesión' 
      });
    }
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  });
});

module.exports = router; 