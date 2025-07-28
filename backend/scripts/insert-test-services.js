const { query } = require('../config/database');

async function insertTestServices() {
  try {
    console.log('🔧 Insertando servicios de prueba...');
    
    // Primero verificar si ya existen servicios
    const existingServices = await query('SELECT COUNT(*) as count FROM services');
    const count = parseInt(existingServices[0].count);
    
    if (count > 0) {
      console.log(`✅ Ya existen ${count} servicios en la base de datos`);
      return;
    }
    
    // Servicios de vehículos
    const vehiculosServices = [
      {
        name: 'Lavado Convencional',
        price: 20000,
        duration: 60,
        description: 'Lavado exterior e interior básico del vehículo',
        category: 'vehiculos'
      },
      {
        name: 'Lavado Detallado',
        price: 100000,
        duration: 120,
        description: 'Lavado completo con detailing profesional',
        category: 'vehiculos'
      },
      {
        name: 'Limpieza de Motor',
        price: 50000,
        duration: 90,
        description: 'Limpieza profunda del motor y compartimento',
        category: 'vehiculos'
      },
      {
        name: 'Limpieza de Tapizados de Auto',
        price: 80000,
        duration: 90,
        description: 'Limpieza profunda de asientos y tapizados del vehículo',
        category: 'vehiculos'
      }
    ];
    
    // Servicios de tapizados
    const tapizadosServices = [
      {
        name: 'Limpieza de Sillones',
        price: 100000,
        duration: 120,
        description: 'Limpieza profunda de sillones y sofás',
        category: 'tapizados'
      },
      {
        name: 'Limpieza de Sillas',
        price: 30000,
        duration: 60,
        description: 'Limpieza de sillas de comedor y oficina',
        category: 'tapizados'
      },
      {
        name: 'Limpieza de Alfombras',
        price: 40000,
        duration: 90,
        description: 'Limpieza profunda de alfombras y tapetes',
        category: 'tapizados'
      },
      {
        name: 'Limpieza de Colchones',
        price: 60000,
        duration: 90,
        description: 'Limpieza y desinfección de colchones',
        category: 'tapizados'
      }
    ];
    
    // Insertar servicios de vehículos
    for (const service of vehiculosServices) {
      await query(`
        INSERT INTO services (name, price, duration, description, category) 
        VALUES ($1, $2, $3, $4, $5)
      `, [service.name, service.price, service.duration, service.description, service.category]);
      console.log(`✅ Servicio insertado: ${service.name}`);
    }
    
    // Insertar servicios de tapizados
    for (const service of tapizadosServices) {
      await query(`
        INSERT INTO services (name, price, duration, description, category) 
        VALUES ($1, $2, $3, $4, $5)
      `, [service.name, service.price, service.duration, service.description, service.category]);
      console.log(`✅ Servicio insertado: ${service.name}`);
    }
    
    console.log('🎉 Todos los servicios de prueba han sido insertados correctamente');
    
  } catch (error) {
    console.error('❌ Error insertando servicios:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertTestServices()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { insertTestServices }; 