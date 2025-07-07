const fs = require('fs');
const path = require('path');

function getRenderCredentials() {
  console.log('🔧 Obteniendo credenciales de Render...');
  
  // Verificar si existe archivo de configuración de Render
  const configFiles = [
    'config.env',
    '.env',
    'render.yaml',
    'render.yml'
  ];
  
  console.log('\n📋 Archivos de configuración encontrados:');
  let foundConfig = false;
  
  configFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
      foundConfig = true;
      
      if (file === 'config.env' || file === '.env') {
        console.log('\n📝 Variables de entorno detectadas:');
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const dbVars = lines.filter(line => 
          line.startsWith('DB_') || 
          line.startsWith('DATABASE_') ||
          line.includes('POSTGRES')
        );
        
        if (dbVars.length > 0) {
          dbVars.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
              const [key, value] = line.split('=');
              if (key && value) {
                const maskedValue = value.length > 4 ? 
                  value.substring(0, 4) + '*'.repeat(value.length - 4) : 
                  '*'.repeat(value.length);
                console.log(`   ${key.trim()}: ${maskedValue}`);
              }
            }
          });
        } else {
          console.log('   ❌ No se encontraron variables de base de datos');
        }
      }
    } else {
      console.log(`   ❌ ${file} (no encontrado)`);
    }
  });
  
  if (!foundConfig) {
    console.log('\n⚠️ No se encontraron archivos de configuración');
    console.log('\n💡 Para configurar manualmente:');
    console.log('1. Ve a tu dashboard de Render');
    console.log('2. Selecciona tu base de datos PostgreSQL');
    console.log('3. Ve a "Connections" o "Info"');
    console.log('4. Copia las credenciales de conexión');
    console.log('5. Crea un archivo config.env con:');
    console.log('   DB_TYPE=postgres');
    console.log('   DB_HOST=tu-host-de-render');
    console.log('   DB_USER=tu-usuario');
    console.log('   DB_PASSWORD=tu-contraseña');
    console.log('   DB_NAME=tu-base-de-datos');
    console.log('   DB_PORT=5432');
    return;
  }
  
  console.log('\n🎯 Próximos pasos:');
  console.log('1. Verifica que las variables de entorno estén configuradas');
  console.log('2. Ejecuta: node scripts/setup-postgres-render.js');
  console.log('3. Si funciona, ejecuta: npm restart');
  console.log('4. Prueba la aplicación');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getRenderCredentials();
}

module.exports = { getRenderCredentials }; 