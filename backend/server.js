const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
// Cargar variables de entorno - usar local por defecto, postgres para producción
const envPath = process.env.NODE_ENV === 'production' ? 'config.env.postgres' : 'config.env.local';
require('dotenv').config({ path: envPath });

// Importar configuración de base de datos
const { testConnection } = require('./config/database');
const { fixDatabase } = require('./scripts/fix-database');

// Importar rutas
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');

// Importar servicios
const reminderCron = require('./scripts/reminderCron');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración para proxy (necesario para Render)
app.set('trust proxy', 1);

// Middleware CORS ultra permisivo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  // No pongas credentials: true si usas '*'
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: false // Deshabilitar CSP para desarrollo
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intente nuevamente en 15 minutos'
  }
});
app.use('/api/', limiter);

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'daytona-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Servir archivos estáticos después de las rutas de la API
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use(express.static(path.join(__dirname, '..')));

// Middleware para manejar rutas no encontradas (debe ir DESPUÉS de las rutas de la API y archivos estáticos)
app.use('*', (req, res) => {
  // Si la ruta comienza con /api, devolver JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Ruta de API no encontrada'
    });
  }
  
  // Para otras rutas, servir el archivo index.html (SPA)
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Daytona Clean Service - Sistema de Turnos',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba específica para CORS
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS funcionando correctamente',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Ruta de estado de la API
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      success: true,
      message: 'API funcionando correctamente',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      database: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware para manejar errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifique la configuración.');
      process.exit(1);
    }

    // Verificar y corregir estructura de la base de datos
    console.log('🔧 Verificando estructura de la base de datos...');
    await fixDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
    });

    // Iniciar cron job de recordatorios
    reminderCron.start();
    console.log('⏰ Cron job de recordatorios iniciado');

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
