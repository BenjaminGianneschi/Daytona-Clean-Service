const { query } = require('../config/database');

async function addCategoryToServices() {
  try {
    console.log('🔧 Agregando columna category a la tabla services...');
    
    // Agregar columna category si no existe
    await query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'
    `);
    
    console.log('✅ Columna category agregada exitosamente');
    
    // Actualizar servicios existentes con categorías
    const updateQueries = [
      // Servicios de vehículos
      `UPDATE services SET category = 'vehiculos' WHERE name ILIKE '%auto%' OR name ILIKE '%pickup%' OR name ILIKE '%suv%' OR name ILIKE '%motor%' OR name ILIKE '%vehículo%'`,
      
      // Servicios de tapizados
      `UPDATE services SET category = 'tapizados' WHERE name ILIKE '%sillón%' OR name ILIKE '%silla%' OR name ILIKE '%colchón%' OR name ILIKE '%alfombra%' OR name ILIKE '%puff%' OR name ILIKE '%tapizado%'`
    ];
    
    for (const updateQuery of updateQueries) {
      await query(updateQuery);
    }
    
    console.log('✅ Categorías asignadas a servicios existentes');
    
    // Mostrar servicios actualizados
    const services = await query('SELECT id, name, category FROM services ORDER BY category, name');
    console.log('📋 Servicios actualizados:');
    services.forEach(service => {
      console.log(`  - ${service.name} (${service.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error actualizando tabla services:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addCategoryToServices()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

module.exports = { addCategoryToServices }; 