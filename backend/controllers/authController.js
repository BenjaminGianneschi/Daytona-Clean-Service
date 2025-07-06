const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Login de administrador
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar administrador por username
    const admins = await query(
      'SELECT * FROM admins WHERE username = ? AND is_active = 1',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const admin = admins[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: admin.id, 
        username: admin.username,
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retornar respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar token (para validar sesión)
const verifyToken = async (req, res) => {
  try {
    // El middleware de autenticación ya verificó el token
    // Solo retornamos la información del usuario
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          fullName: req.user.full_name,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validar campos requeridos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    // Validar longitud de nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener administrador actual
    const admins = await query(
      'SELECT password_hash FROM admins WHERE id = ?',
      [userId]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, admins[0].password_hash);
    
    if (!isValidCurrentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await query(
      'UPDATE admins SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo administrador (solo super admin)
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'admin' } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await query(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya existe'
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya existe'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo administrador
    const result = await query(
      'INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, fullName, role]
    );

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: {
        id: result.insertId,
        username,
        email,
        fullName,
        role
      }
    });

  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  verifyToken,
  changePassword,
  createAdmin
}; 