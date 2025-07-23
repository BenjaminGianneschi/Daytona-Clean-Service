const fetch = require('node-fetch');

const API_BASE = 'https://daytona-clean-service.onrender.com/api';

async function testAvailability() {
  console.log('🧪 Probando sistema de disponibilidad...\n');

  try {
    // 1. Obtener servicios disponibles
    console.log('1. Obteniendo servicios...');
    const servicesResponse = await fetch(`${API_BASE}/services`);
    const servicesData = await servicesResponse.json();
    
    if (!servicesData.success) {
      console.error('❌ Error obteniendo servicios');
      return;
    }
    
    console.log(`✅ Servicios cargados: ${servicesData.services.length} servicios`);
    servicesData.services.forEach(s => {
      console.log(`   - ${s.name}: ${s.duration}min (${Math.round(s.duration/60*10)/10}h)`);
    });
    console.log('');

    // 2. Probar disponibilidad para mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`2. Probando disponibilidad para ${dateStr}...`);
    
    // Probar con diferentes duraciones
    const testDurations = [60, 120, 180, 240];
    
    for (const duration of testDurations) {
      console.log(`\n   Probando con duración: ${duration}min (${Math.round(duration/60*10)/10}h)`);
      
      const availabilityResponse = await fetch(`${API_BASE}/appointments/availability/${dateStr}?duration=${duration}`);
      const availabilityData = await availabilityResponse.json();
      
      if (availabilityData.success) {
        const availableSlots = availabilityData.data.availableSlots.filter(slot => slot.available);
        console.log(`   ✅ Slots disponibles: ${availableSlots.length}`);
        
        if (availableSlots.length > 0) {
          console.log(`   📅 Primeros 3 slots disponibles:`);
          availableSlots.slice(0, 3).forEach(slot => {
            console.log(`      - ${slot.startTime} - ${slot.endTime}`);
          });
        }
      } else {
        console.log(`   ❌ Error: ${availabilityData.message}`);
      }
    }

    // 3. Crear un turno de prueba
    console.log('\n3. Creando turno de prueba...');
    const testAppointment = {
      appointmentDate: dateStr,
      appointmentTime: '10:00:00',
      services: [
        { service_id: 1, quantity: 1 } // Limpieza Interior Completa
      ],
      serviceLocation: 'Test Location',
      clientName: 'Test User',
      clientPhone: '123456789',
      clientEmail: 'test@test.com',
      service_type: 'test'
    };

    const createResponse = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAppointment)
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log(`✅ Turno de prueba creado con ID: ${createData.appointmentId}`);
      
      // 4. Verificar que el horario ahora aparece como ocupado
      console.log('\n4. Verificando que el horario aparece como ocupado...');
      const checkResponse = await fetch(`${API_BASE}/appointments/availability/${dateStr}?duration=120`);
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        const slot10am = checkData.data.availableSlots.find(slot => slot.startTime === '10:00');
        if (slot10am) {
          console.log(`   Slot 10:00 - ${slot10am.available ? '❌ ERROR: Debería estar ocupado' : '✅ Correcto: Está ocupado'}`);
        }
      }
    } else {
      console.log(`❌ Error creando turno: ${createData.message}`);
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

testAvailability(); 