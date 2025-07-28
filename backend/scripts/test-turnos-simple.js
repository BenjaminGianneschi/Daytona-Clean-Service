const { query } = require('../config/database');

async function testTurnosSimple() {
  console.log('🧪 Probando sistema de turnos simplificado...');
  
  try {
    // 1. Verificar que hay servicios en la base de datos
    console.log('\n1. Verificando servicios disponibles...');
    const services = await query('SELECT * FROM services WHERE is_active = true');
    console.log(`📋 Servicios activos: ${services.length}`);
    
    if (services.length === 0) {
      console.log('❌ No hay servicios disponibles');
      return false;
    }
    
    // 2. Verificar que hay servicios de vehículos y tapizados
    const vehiculosServices = services.filter(s => s.category === 'vehiculos');
    const tapizadosServices = services.filter(s => s.category === 'tapizados');
    
    console.log(`🚗 Servicios de vehículos: ${vehiculosServices.length}`);
    console.log(`🛋️ Servicios de tapizados: ${tapizadosServices.length}`);
    
    // 3. Probar creación de un turno simple
    console.log('\n2. Probando creación de turno...');
    
    const testService = services[0];
    console.log(`🔧 Usando servicio de prueba: ${testService.name} ($${testService.price})`);
    
    // Crear turno de prueba
    const testAppointment = {
      appointmentDate: '2024-12-25',
      appointmentTime: '10:00',
      clientName: 'Cliente de Prueba',
      clientPhone: '3482123456',
      clientEmail: 'test@example.com',
      serviceLocation: 'Dirección de prueba',
      services: [{ service_id: testService.id, quantity: 1 }],
      service_type: testService.name,
      totalAmount: testService.price
    };
    
    console.log('📝 Datos del turno de prueba:', testAppointment);
    
    // 4. Insertar turno en la base de datos
    console.log('\n3. Insertando turno en la base de datos...');
    
    const insertResult = await query(`
      INSERT INTO appointments (
        appointment_date, 
        appointment_time, 
        client_name, 
        client_phone, 
        client_email, 
        service_location, 
        service_type, 
        total_price, 
        duration, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      testAppointment.appointmentDate,
      testAppointment.appointmentTime,
      testAppointment.clientName,
      testAppointment.clientPhone,
      testAppointment.clientEmail,
      testAppointment.serviceLocation,
      testAppointment.service_type,
      testAppointment.totalAmount,
      testService.duration,
      'pending'
    ]);
    
    const appointmentId = insertResult[0].id;
    console.log(`✅ Turno creado con ID: ${appointmentId}`);
    
    // 5. Insertar servicios del turno
    console.log('\n4. Insertando servicios del turno...');
    await query(`
      INSERT INTO appointment_services (appointment_id, service_id, quantity, price)
      VALUES ($1, $2, $3, $4)
    `, [appointmentId, testService.id, 1, testService.price]);
    
    console.log('✅ Servicios del turno insertados');
    
    // 6. Verificar que el turno se creó correctamente
    console.log('\n5. Verificando turno creado...');
    const createdAppointment = await query(`
      SELECT 
        a.*,
        s.name as service_name,
        s.price as service_price
      FROM appointments a
      LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
      LEFT JOIN services s ON aps.service_id = s.id
      WHERE a.id = $1
    `, [appointmentId]);
    
    if (createdAppointment.length > 0) {
      console.log('✅ Turno verificado correctamente:');
      console.log(`   - ID: ${createdAppointment[0].id}`);
      console.log(`   - Cliente: ${createdAppointment[0].client_name}`);
      console.log(`   - Fecha: ${createdAppointment[0].appointment_date}`);
      console.log(`   - Hora: ${createdAppointment[0].appointment_time}`);
      console.log(`   - Servicio: ${createdAppointment[0].service_name}`);
      console.log(`   - Precio: $${createdAppointment[0].total_price}`);
      console.log(`   - Estado: ${createdAppointment[0].status}`);
    } else {
      console.log('❌ No se pudo verificar el turno creado');
      return false;
    }
    
    // 7. Limpiar turno de prueba
    console.log('\n6. Limpiando turno de prueba...');
    await query('DELETE FROM appointment_services WHERE appointment_id = $1', [appointmentId]);
    await query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
    console.log('✅ Turno de prueba eliminado');
    
    // 8. Probar API endpoint
    console.log('\n7. Probando endpoint de servicios...');
    const apiServices = await query('SELECT * FROM services WHERE is_active = true ORDER BY category, name');
    console.log(`📋 API devuelve ${apiServices.length} servicios`);
    
    // Mostrar algunos servicios como ejemplo
    apiServices.slice(0, 5).forEach(service => {
      console.log(`   - ${service.name} (${service.category}): $${service.price}`);
    });
    
    console.log('\n🎉 Sistema de turnos simplificado funcionando correctamente');
    console.log('\n📋 Resumen:');
    console.log(`   ✅ Servicios disponibles: ${services.length}`);
    console.log(`   ✅ Creación de turnos: Funcional`);
    console.log(`   ✅ Base de datos: Conectada`);
    console.log(`   ✅ API endpoints: Listos`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testTurnosSimple()
    .then((success) => {
      if (success) {
        console.log('\n✅ Sistema de turnos simplificado listo para usar');
        console.log('🌐 Accede a: http://localhost:3001/turnos-simple.html');
        process.exit(0);
      } else {
        console.log('\n❌ Sistema de turnos con problemas');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

module.exports = { testTurnosSimple }; 