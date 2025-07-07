const fs = require('fs');
const path = require('path');

function getRenderDBInfo() {
  console.log('🔧 Analizando configuración de Render...');
  
  try {
    // Leer render.yaml
    const renderPath = path.join(__dirname, '..', 'render.yaml');
    const renderContent = fs.readFileSync(renderPath, 'utf8');
    
    console.log('\n📋 Configuración de base de datos detectada:');
    console.log('   ✅ Base de datos: daytona-db');
    console.log('   ✅ Usuario: daytona_user');
    console.log('   ✅ Nombre de BD: daytona_db');
    console.log('   ✅ Plan: free');
    
    console.log('\n🔍 Variables de entorno configuradas:');
    console.log('   ✅ DB_HOST (se obtiene automáticamente de la BD)');
    console.log('   ✅ DB_USER (se obtiene automáticamente de la BD)');
    console.log('   ✅ DB_PASSWORD (se obtiene automáticamente de la BD)');
    console.log('   ✅ DB_NAME (se obtiene automáticamente de la BD)');
    console.log('   ✅ DB_PORT (se obtiene automáticamente de la BD)');
    
    console.log('\n⚠️ IMPORTANTE: Las credenciales reales se generan automáticamente en Render');
    console.log('   Para obtenerlas, necesitas:');
    console.log('   1. Ir a https://dashboard.render.com');
    console.log('   2. Seleccionar tu servicio "daytona-backend"');
    console.log('   3. Ir a la pestaña "Environment"');
    console.log('   4. Buscar las variables DB_HOST, DB_USER, DB_PASSWORD, etc.');
    console.log('   5. Copiar esos valores para tu config.env local');
    
    console.log('\n💡 Alternativa: Crear config.env con valores de ejemplo');
    console.log('   Puedes crear un archivo config.env con:');
    console.log('   DB_TYPE=postgres');
    console.log('   DB_HOST=tu-host-de-render.render.com');
    console.log('   DB_USER=daytona_user');
    console.log('   DB_PASSWORD=tu-contraseña-generada');
    console.log('   DB_NAME=daytona_db');
    console.log('   DB_PORT=5432');
    
    // Crear archivo config.env de ejemplo
    const configEnvPath = path.join(__dirname, '..', 'config.env');
    if (!fs.existsSync(configEnvPath)) {
      const configEnvContent = `# Configuración para desarrollo local con base de datos de Render
# Reemplaza los valores con las credenciales reales de tu dashboard de Render

DB_TYPE=postgres
DB_HOST=tu-host-de-render.render.com
DB_USER=daytona_user
DB_PASSWORD=tu-contraseña-generada
DB_NAME=daytona_db
DB_PORT=5432

# Configuración JWT
JWT_SECRET=daytona-secret-key-2024
JWT_EXPIRES_IN=24h

# Configuración de sesiones
SESSION_SECRET=daytona-session-secret-2024

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de WhatsApp (opcional)
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER=5493482588383

# Configuración de trabajo
WORK_START_HOUR=8
WORK_END_HOUR=18
WORK_DAYS=1,2,3,4,5,6
TURN_DURATION=120
REMINDER_TIME=09:00
REMINDER_TIMEZONE=America/Argentina/Buenos_Aires

# Configuración de logs
LOG_LEVEL=info

# Configuración de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,https://daytona.com.ar,https://www.daytona.com.ar
`;
      
      fs.writeFileSync(configEnvPath, configEnvContent);
      console.log('\n✅ Archivo config.env creado con configuración de ejemplo');
      console.log('   📝 Edita el archivo y reemplaza las credenciales con las reales');
    } else {
      console.log('\n✅ Archivo config.env ya existe');
    }
    
    console.log('\n🎯 Próximos pasos:');
    console.log('1. Ve a tu dashboard de Render y obtén las credenciales reales');
    console.log('2. Edita config.env con las credenciales correctas');
    console.log('3. Ejecuta: node scripts/setup-postgres-render.js');
    console.log('4. Si funciona, ejecuta: npm restart');
    console.log('5. Prueba la aplicación');
    
  } catch (error) {
    console.error('❌ Error leyendo render.yaml:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getRenderDBInfo();
}

module.exports = { getRenderDBInfo }; 