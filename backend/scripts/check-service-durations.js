const { query } = require('../config/database');

async function checkServiceDurations() {
  console.log('🔍 Verificando duraciones de servicios...\n');
  
  try {
    // Obtener todos los servicios
    const services = await query('SELECT id, name, duration, price FROM services ORDER BY id');
    
    console.log('📋 Servicios y sus duraciones:');
    console.log('ID | Nombre | Duración (min) | Precio');
    console.log('---|--------|----------------|--------');
    
    services.forEach(service => {
      console.log(`${service.id.toString().padStart(2)} | ${service.name.padEnd(20)} | ${service.duration.toString().padStart(14)} | $${service.price}`);
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`- Total de servicios: ${services.length}`);
    console.log(`- Duración promedio: ${Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)} minutos`);
    console.log(`- Duración mínima: ${Math.min(...services.map(s => s.duration))} minutos`);
    console.log(`- Duración máxima: ${Math.max(...services.map(s => s.duration))} minutos`);
    
    // Verificar si hay servicios con duración 0 o null
    const invalidServices = services.filter(s => !s.duration || s.duration <= 0);
    if (invalidServices.length > 0) {
      console.log(`\n⚠️ Servicios con duración inválida:`);
      invalidServices.forEach(s => {
        console.log(`- ID ${s.id}: ${s.name} (duración: ${s.duration})`);
      });
    } else {
      console.log(`\n✅ Todos los servicios tienen duración válida`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando servicios:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkServiceDurations()
    .then(() => {
      console.log('\n✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { checkServiceDurations }; 