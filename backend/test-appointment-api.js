const fetch = require('node-fetch');

const API_BASE = 'https://daytona-clean-service.onrender.com/api';

async function testAppointmentAPI() {
  console.log('🧪 Probando API de turnos...\n');

  try {
    // 1. Probar health check
    console.log('1. Probando health check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    console.log('✅ Health check completado\n');

    // 2. Probar disponibilidad
    console.log('2. Probando disponibilidad...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availabilityResponse = await fetch(`${API_BASE}/appointments/availability/${dateStr}`);
    const availabilityData = await availabilityResponse.json();
    console.log('Disponibilidad:', availabilityData);
    console.log('✅ Disponibilidad completada\n');

    // 3. Probar creación de turno (sin autenticación)
    console.log('3. Probando creación de turno...');
    const appointmentData = {
      appointmentDate: dateStr,
      startTime: '10:00',
      services: [
        {
          name: 'Limpieza Interior Completa',
          quantity: 1,
          price: 15000
        }
      ],
      totalAmount: 15000,
      notes: 'Turno de prueba desde script',
      serviceLocation: 'Taller Daytona'
    };

    const createResponse = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    const createData = await createResponse.json();
    console.log('Creación de turno:', createData);
    
    if (createData.success) {
      console.log('✅ Turno creado exitosamente');
      
      // 4. Probar obtener todos los turnos
      console.log('\n4. Probando obtener todos los turnos...');
      const getAllResponse = await fetch(`${API_BASE}/appointments/admin/all`);
      const getAllData = await getAllResponse.json();
      console.log('Todos los turnos:', getAllData);
      console.log('✅ Obtención de turnos completada');
    } else {
      console.log('❌ Error creando turno:', createData.message);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testAppointmentAPI(); 