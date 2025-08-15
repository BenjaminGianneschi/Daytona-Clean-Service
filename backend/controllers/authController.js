const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Login de usuario regular
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const users = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Registrar evento de analytics si está disponible el helper
    if (req.trackEvent) {
      await req.trackEvent('login', {
        userId: user.id,
        userRole: user.role || 'user',
        isAdmin: (user.role === 'admin')
      });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Error en login de usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Registro de usuario regular
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el email ya existe
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, phone, passwordHash, 'user']
    );

    const newUserId = result[0].id;

    // Registrar evento de analytics si está disponible el helper
    if (req.trackEvent) {
      await req.trackEvent('register', {
        userId: newUserId,
        userEmail: email,
        hasPhone: !!phone
      });
    }

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};



module.exports = {
  login,
  register
};