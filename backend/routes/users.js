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

// Obtener historial de turnos del usuario
router.get('/appointments', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const appointments = await query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time as start_time,
        a.status,
        a.total_price as total_amount,
        a.notes,
        a.service_type as services
      FROM appointments a
      WHERE a.user_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [req.session.userId]);
    
    res.json({
      success: true,
      appointments: appointments
    });
    
  } catch (error) {
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