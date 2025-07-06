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
      'SELECT id FROM users WHERE email = ?',
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
      'SELECT id FROM users WHERE phone = ?',
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
    
    // Crear usuario
    const result = await query(
      'INSERT INTO users (name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, phone, passwordHash]
    );
    
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
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
    
    // Buscar usuario por email
    const users = await query(
      'SELECT id, name, email, phone, password_hash FROM users WHERE email = ?',
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
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
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
        a.start_time,
        a.status,
        a.total_amount,
        a.notes,
        a.address,
        GROUP_CONCAT(s.service_name SEPARATOR ', ') as services
      FROM appointments a
      LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
      LEFT JOIN services s ON aps.service_id = s.id
      WHERE a.client_phone = (SELECT phone FROM users WHERE id = ?)
      GROUP BY a.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
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
      JOIN users u ON a.client_phone = u.phone
      WHERE a.id = ? AND u.id = ?
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
      'UPDATE appointments SET status = ? WHERE id = ?',
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

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
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

// Verificar si el usuario está autenticado
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }
    
    const users = await query(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
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
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router; 