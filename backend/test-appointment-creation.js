const appointmentModel = require('./models/appointmentModel');

async function testAppointmentCreation() {
  try {
    console.log('🧪 Iniciando prueba de creación de turno...');
    
    // Datos de prueba similares a los que envía el frontend
    const testData = {
      appointmentDate: '2025-01-20',
      appointmentTime: '09:00',
      userId: null,
      clientName: 'Juan Pérez',
      clientPhone: '3482123456',
      clientEmail: 'juan@test.com',
      serviceLocation: 'Av. San Martín 123, Resistencia',
      services: [
        {
          service_id: 1,
          quantity: 1
        }
      ],
      service_type: 'vehiculo',
      totalAmount: 20000
    };
    
    console.log('📋 Datos de prueba:', testData);
    
    // Intentar crear el turno
    const appointmentId = await appointmentModel.createAppointment(testData);
    
    console.log('✅ Turno creado exitosamente con ID:', appointmentId);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testAppointmentCreation(); 