const analyticsModel = require('../models/analyticsModel');
const useragent = require('express-useragent');

// Función para generar session ID único
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para detectar dispositivo
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.isMobile) return 'mobile';
  if (userAgent.isTablet) return 'tablet';
  if (userAgent.isDesktop) return 'desktop';
  return 'unknown';
}

// Función para obtener IP del cliente
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// Middleware principal de analytics
const trackPageView = async (req, res, next) => {
  try {
    // Solo trackear requests GET para archivos HTML o rutas API específicas
    if (req.method !== 'GET') {
      return next();
    }

    // Excluir assets estáticos (CSS, JS, imágenes, favicon, etc.)
    const excludePaths = [
      '/css/', '/js/', '/img/', '/favicon', '.css', '.js', '.png', '.jpg', 
      '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot',
      '/api/analytics/', // Evitar loop en endpoints de analytics
      '/api/health',
      '.map'
    ];

    const shouldExclude = excludePaths.some(path => req.path.includes(path));
    if (shouldExclude) {
      return next();
    }

    // Obtener o crear session ID
    let sessionId = req.cookies?.analytics_session_id;
    if (!sessionId) {
      sessionId = generateSessionId();
      try {
        res.cookie('analytics_session_id', sessionId, {
          maxAge: 30 * 60 * 1000, // 30 minutos
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        });
      } catch (cookieError) {
        // Si no se puede setear la cookie, usar session ID temporal
        console.log('No se pudo setear cookie de analytics, usando session temporal');
      }
    }

    // Detectar información del usuario
    const userAgent = useragent.parse(req.headers['user-agent']);
    const clientIP = getClientIP(req);
    
    // Obtener user ID si está autenticado
    let userId = null;
    try {
      if (req.headers.authorization) {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_aqui');
        userId = decoded.id;
      }
    } catch (err) {
      // Usuario no autenticado, userId permanece null
    }

    // Determinar tipo de evento
    let eventType = 'page_view';
    if (req.path.includes('/turnos')) eventType = 'service_view';
    if (req.path.includes('/login')) eventType = 'login_page';
    if (req.path.includes('/register')) eventType = 'register_page';

    // Construir URL completa
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // Datos del evento
    const eventData = {
      sessionId,
      userId,
      eventType,
      pageUrl: fullUrl,
      pageTitle: null, // Se actualizará desde el frontend
      referrerUrl: req.headers.referer || null,
      userAgent: req.headers['user-agent'],
      ipAddress: clientIP,
      deviceType: getDeviceType(userAgent),
      browser: userAgent.browser,
      os: userAgent.os,
      language: req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : null,
      metadata: {
        path: req.path,
        query: req.query
      }
    };

    // Registrar evento de forma asíncrona (no bloquear la respuesta)
    setImmediate(async () => {
      try {
        await analyticsModel.recordEvent(eventData);
      } catch (error) {
        console.error('Error registrando analytics:', error);
      }
    });

    next();
  } catch (error) {
    console.error('Error en middleware de analytics:', error);
    next(); // Continuar aunque falle el tracking
  }
};

// Middleware para trackear eventos específicos (desde API)
const trackEvent = async (req, res, next) => {
  try {
    // Agregar función helper para trackear eventos desde controladores
    req.trackEvent = async (eventType, metadata = {}) => {
      try {
        let sessionId = req.cookies?.analytics_session_id;
        if (!sessionId) {
          sessionId = generateSessionId();
        }

        const userAgent = useragent.parse(req.headers['user-agent']);
        const clientIP = getClientIP(req);
        
        let userId = null;
        if (req.user) {
          userId = req.user.id;
        }

        const eventData = {
          sessionId,
          userId,
          eventType,
          pageUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          userAgent: req.headers['user-agent'],
          ipAddress: clientIP,
          deviceType: getDeviceType(userAgent),
          browser: userAgent.browser,
          os: userAgent.os,
          language: req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : null,
          metadata: {
            ...metadata,
            endpoint: req.path,
            method: req.method
          }
        };

        await analyticsModel.recordEvent(eventData);
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    };

    next();
  } catch (error) {
    console.error('Error en middleware trackEvent:', error);
    next();
  }
};

// Middleware para capturar duración de página (para cerrar sesiones)
const trackPageDuration = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Math.round((Date.now() - startTime) / 1000); // en segundos
    
    // Si la duración es muy corta (< 1 segundo), probablemente es un asset
    if (duration >= 1 && req.method === 'GET') {
      const sessionId = req.cookies?.analytics_session_id;
      if (sessionId) {
        // Actualizar duración de forma asíncrona
        setImmediate(async () => {
          try {
            // Esto se podría usar para calcular tiempo en página promedio
            // Por ahora solo lo loggeamos si es necesario para debug
            if (process.env.NODE_ENV === 'development') {
              console.log(`Página ${req.path} vista por ${duration}s`);
            }
          } catch (error) {
            console.error('Error actualizando duración:', error);
          }
        });
      }
    }
  });
  
  next();
};

module.exports = {
  trackPageView,
  trackEvent,
  trackPageDuration
};