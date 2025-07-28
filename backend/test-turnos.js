// Script de prueba para el sistema de turnos
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testTurnos() {
  console.log('🧪 Iniciando pruebas del sistema de turnos...\n');

  try {
    // 1. Probar obtención de disponibilidad
    console.log('1️⃣ Probando obtención de disponibilidad...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availabilityResponse = await fetch(`${BASE_URL}/api/appointments/availability/${dateStr}`);
    const availabilityData = await availabilityResponse.json();
    
    if (availabilityData.success) {
      console.log('✅ Disponibilidad obtenida correctamente');
      console.log(`   Horarios disponibles: ${availabilityData.availableHours.join(', ')}`);
    } else {
      console.log('❌ Error obteniendo disponibilidad:', availabilityData.message);
    }

    // 2. Probar obtención de servicios
    console.log('\n2️⃣ Probando obtención de servicios...');
    const servicesResponse = await fetch(`${BASE_URL}/api/appointments/services`);
    const servicesData = await servicesResponse.json();
    
    if (servicesData.success) {
      console.log('✅ Servicios obtenidos correctamente');
      console.log(`   Total de servicios: ${servicesData.services.length}`);
    } else {
      console.log('❌ Error obteniendo servicios:', servicesData.message);
    }

    // 3. Probar creación de turno
    console.log('\n3️⃣ Probando creación de turno...');
    const testAppointment = {
      appointmentDate: dateStr,
      appointmentTime: '10:00',
      services: [
        {
          service_id: 1,
          quantity: 1
        }
      ],
      serviceLocation: 'Calle de prueba 123, Reconquista',
      clientName: 'Cliente de Prueba',
      clientPhone: '3482123456',
      clientEmail: 'test@example.com',
      service_type: 'Limpieza Interior Completa',
      totalAmount: 15000
    };

    const createResponse = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAppointment)
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Turno creado correctamente');
      console.log(`   ID del turno: ${createData.appointmentId}`);
    } else {
      console.log('❌ Error creando turno:', createData.message);
    }

    console.log('\n🎉 Pruebas completadas');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  testTurnos();
}

module.exports = { testTurnos }; 