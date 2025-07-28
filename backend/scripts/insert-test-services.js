const { query } = require('../config/database');

async function insertTestServices() {
  console.log('🔧 Insertando servicios de prueba...');
  
  try {
    // Primero, limpiar servicios existentes
    console.log('🧹 Limpiando servicios existentes...');
    await query('DELETE FROM services');
    
    // Servicios de vehículos
    const vehiculosServices = [
      {
        name: 'Lavado de Auto',
        description: 'Lavado completo exterior e interior del vehículo',
        price: 15000,
        duration: 60,
        category: 'vehiculos',
        is_active: true
      },
      {
        name: 'Lavado de Pickup',
        description: 'Lavado completo de pickup con caja',
        price: 20000,
        duration: 90,
        category: 'vehiculos',
        is_active: true
      },
      {
        name: 'Lavado de SUV',
        description: 'Lavado completo de SUV o camioneta',
        price: 18000,
        duration: 75,
        category: 'vehiculos',
        is_active: true
      },
      {
        name: 'Limpieza de Motor',
        description: 'Limpieza profunda del compartimento del motor',
        price: 12000,
        duration: 45,
        category: 'vehiculos',
        is_active: true
      }
    ];
    
    // Servicios de tapizados
    const tapizadosServices = [
      {
        name: 'Limpieza de Sillón',
        description: 'Limpieza profunda de sillón de 3 cuerpos',
        price: 25000,
        duration: 120,
        category: 'tapizados',
        is_active: true
      },
      {
        name: 'Limpieza de Silla',
        description: 'Limpieza de silla individual',
        price: 8000,
        duration: 30,
        category: 'tapizados',
        is_active: true
      },
      {
        name: 'Limpieza de Colchón',
        description: 'Limpieza profunda de colchón',
        price: 30000,
        duration: 150,
        category: 'tapizados',
        is_active: true
      },
      {
        name: 'Limpieza de Alfombra',
        description: 'Limpieza de alfombra por metro cuadrado',
        price: 5000,
        duration: 20,
        category: 'tapizados',
        is_active: true
      },
      {
        name: 'Limpieza de Puff',
        description: 'Limpieza de puff o puf',
        price: 15000,
        duration: 60,
        category: 'tapizados',
        is_active: true
      }
    ];
    
    // Insertar servicios de vehículos
    console.log('🚗 Insertando servicios de vehículos...');
    for (const service of vehiculosServices) {
      await query(`
        INSERT INTO services (name, description, price, duration, category, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [service.name, service.description, service.price, service.duration, service.category, service.is_active]);
      console.log(`✅ ${service.name} - $${service.price.toLocaleString()}`);
    }
    
    // Insertar servicios de tapizados
    console.log('🛋️ Insertando servicios de tapizados...');
    for (const service of tapizadosServices) {
      await query(`
        INSERT INTO services (name, description, price, duration, category, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [service.name, service.description, service.price, service.duration, service.category, service.is_active]);
      console.log(`✅ ${service.name} - $${service.price.toLocaleString()}`);
    }
    
    // Verificar que se insertaron correctamente
    const totalServices = await query('SELECT COUNT(*) as count FROM services');
    const vehiculosCount = await query("SELECT COUNT(*) as count FROM services WHERE category = 'vehiculos'");
    const tapizadosCount = await query("SELECT COUNT(*) as count FROM services WHERE category = 'tapizados'");
    
    console.log('\n📊 Resumen de servicios insertados:');
    console.log(`   Total: ${totalServices[0].count}`);
    console.log(`   Vehículos: ${vehiculosCount[0].count}`);
    console.log(`   Tapizados: ${tapizadosCount[0].count}`);
    
    console.log('\n🎉 Servicios de prueba insertados correctamente');
    console.log('🌐 El turnero ahora debería funcionar correctamente');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error insertando servicios:', error);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertTestServices()
    .then((success) => {
      if (success) {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Script falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { insertTestServices }; 