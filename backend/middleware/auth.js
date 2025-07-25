const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar token JWT de usuarios regulares
const authenticateUserToken = async (req, res, next) => {
  try {
    console.log('🔍 Verificando autenticación...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('📝 Token recibido:', token ? 'Sí' : 'No');
    console.log('🔑 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'Sí' : 'No');

    if (!token) {
      console.log('❌ No hay token');
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);

    // Verificar que el usuario existe en la tabla users
    const user = await query(
      'SELECT id, name, email, phone, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    console.log('👤 Usuario encontrado:', user.length > 0 ? 'Sí' : 'No');

    if (user.length === 0) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    req.user = user[0];
    console.log('✅ Usuario autenticado:', req.user.name, 'Rol:', req.user.role);
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    
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
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};



// Exportar el middleware principal como 'auth' para compatibilidad
const auth = authenticateUserToken;

// Middleware para verificar permisos de administrador
const requireAdmin = (req, res, next) => {
  // Primero verificar que el usuario esté autenticado
  auth(req, res, (err) => {
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
};

module.exports = {
  auth,
  requireAdmin
};