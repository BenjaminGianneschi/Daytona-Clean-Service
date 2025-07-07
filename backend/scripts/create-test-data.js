const mysql = require('mysql2/promise');

async function createTestData() {
  let connection;
  
  try {
    console.log('🔧 Conectando a MySQL...');
    
    // Configuración básica
    const config = {
      host: 'localhost',
      user: 'root',
      password: 'root', // Contraseña que funcionó en el test
      database: 'daytona_turnos',
      port: 3306
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida');
    
    // 1. Crear usuario de prueba
    console.log('\n👤 Creando usuario de prueba...');
    
    try {
      await connection.execute(`
        INSERT INTO users (name, email, phone, password_hash) 
        VALUES ('Usuario Prueba', 'test@daytona.com', '3482123456', '$2a$10$test')
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `);
      console.log('✅ Usuario de prueba creado/actualizado');
    } catch (error) {
      console.log('⚠️ Error creando usuario:', error.message);
    }
    
    // 2. Obtener ID del usuario
    const [users] = await connection.execute(`
      SELECT id FROM users WHERE email = 'test@daytona.com'
    `);
    
    if (users.length === 0) {
      console.log('❌ No se pudo crear el usuario de prueba');
      return;
    }
    
    const userId = users[0].id;
    console.log(`✅ Usuario ID: ${userId}`);
    
    // 3. Crear cliente de prueba
    console.log('\n👥 Creando cliente de prueba...');
    
    try {
      await connection.execute(`
        INSERT INTO clients (name, phone, email) 
        VALUES ('Usuario Prueba', '3482123456', 'test@daytona.com')
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `);
      console.log('✅ Cliente de prueba creado/actualizado');
    } catch (error) {
      console.log('⚠️ Error creando cliente:', error.message);
    }
    
    // 4. Obtener ID del cliente
    const [clients] = await connection.execute(`
      SELECT id FROM clients WHERE email = 'test@daytona.com'
    `);
    
    if (clients.length === 0) {
      console.log('❌ No se pudo crear el cliente de prueba');
      return;
    }
    
    const clientId = clients[0].id;
    console.log(`✅ Cliente ID: ${clientId}`);
    
    // 5. Crear turno de prueba
    console.log('\n📅 Creando turno de prueba...');
    
    try {
      const [appointmentResult] = await connection.execute(`
        INSERT INTO appointments (client_id, user_id, appointment_date, start_time, end_time, total_amount, status) 
        VALUES (?, ?, '2024-12-25', '10:00:00', '12:00:00', 20000.00, 'pending')
      `, [clientId, userId]);
      
      const appointmentId = appointmentResult.insertId;
      console.log(`✅ Turno creado con ID: ${appointmentId}`);
      
      // 6. Agregar servicio al turno
      console.log('\n🛠️ Agregando servicio al turno...');
      
      // Obtener un servicio existente
      const [services] = await connection.execute(`
        SELECT id FROM services LIMIT 1
      `);
      
      if (services.length > 0) {
        const serviceId = services[0].id;
        
        await connection.execute(`
          INSERT INTO appointment_services (appointment_id, service_id, quantity, unit_price, total_price) 
          VALUES (?, ?, 1, 20000.00, 20000.00)
        `, [appointmentId, serviceId]);
        
        console.log('✅ Servicio agregado al turno');
      }
      
      // 7. Agregar ubicación
      console.log('\n📍 Agregando ubicación...');
      
      await connection.execute(`
        INSERT INTO service_locations (appointment_id, address, city, postal_code) 
        VALUES (?, 'Av. San Martín 123', 'Villa María', '5900')
      `, [appointmentId]);
      
      console.log('✅ Ubicación agregada');
      
    } catch (error) {
      console.log('⚠️ Error creando turno:', error.message);
    }
    
    // 8. Verificar que todo se creó correctamente
    console.log('\n🔍 Verificando datos creados...');
    
    const [appointments] = await connection.execute(`
      SELECT 
        a.id,
        a.appointment_date,
        a.start_time,
        a.status,
        a.total_amount,
        a.user_id,
        c.name as client_name,
        u.name as user_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
    `, [userId]);
    
    console.log('📋 Turnos encontrados:');
    appointments.forEach(app => {
      console.log(`   - ID: ${app.id}, Fecha: ${app.appointment_date}, Cliente: ${app.client_name}, Usuario: ${app.user_name}`);
    });
    
    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\n📝 Para probar:');
    console.log('1. Inicia sesión con: test@daytona.com');
    console.log('2. Ve a mi-cuenta.html');
    console.log('3. Deberías ver el turno en el historial');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 SOLUCIÓN:');
      console.log('1. Verifica que MySQL esté ejecutándose');
      console.log('2. Si tienes contraseña, modifica el script');
      console.log('3. Si usas XAMPP, la contraseña suele estar vacía');
    }
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { createTestData }; 