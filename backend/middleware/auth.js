const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar token JWT de usuarios regulares
const authenticateUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe en la tabla users
    const user = await query(
      'SELECT id, name, email, phone, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    req.user = user[0];
    next();
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
    console.error('Error en autenticación de usuario:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};



// Middleware para verificar permisos de administrador
const requireAdmin = async (req, res, next) => {
  try {
    // Primero verificar que el usuario esté autenticado
    await authenticateUserToken(req, res, (err) => {
      if (err) return next(err);
      
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
      }
      
      next();
    });
  } catch (error) {
    console.error('Error verificando permisos de admin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// Exportar el middleware principal como 'auth' para compatibilidad
const auth = authenticateUserToken;

// Crear un middleware requireAdmin que use auth
const requireAdmin = async (req, res, next) => {
  try {
    // Primero verificar que el usuario esté autenticado
    await auth(req, res, (err) => {
      if (err) return next(err);
      
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
      }
      
      next();
    });
  } catch (error) {
    console.error('Error verificando permisos de admin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  auth,
  requireAdmin
};