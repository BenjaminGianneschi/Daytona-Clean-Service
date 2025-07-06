require('dotenv').config();
const { fixDatabase } = require('./fix-database');

console.log('🔍 Verificando base de datos en Render...');
console.log('📊 Variables de entorno:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

fixDatabase()
  .then(() => {
    console.log('✅ Verificación completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en la verificación:', error);
    process.exit(1);
  }); 