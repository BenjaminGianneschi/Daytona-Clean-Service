const fetch = require('node-fetch');

async function quickTest() {
  console.log('🚀 Prueba rápida de disponibilidad...\n');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  try {
    // 1. Ver disponibilidad sin turnos
    console.log(`1. Verificando disponibilidad para ${dateStr}...`);
    const response = await fetch(`https://daytona-clean-service.onrender.com/api/appointments/availability/${dateStr}?duration=180`);
    const data = await response.json();
    
    if (data.success) {
      const availableSlots = data.data.availableSlots.filter(slot => slot.available);
      console.log(`✅ Slots disponibles: ${availableSlots.length}`);
      
      if (availableSlots.length > 0) {
        console.log('📅 Primeros 5 slots:');
        availableSlots.slice(0, 5).forEach(slot => {
          console.log(`   - ${slot.startTime} - ${slot.endTime}`);
        });
      }
    } else {
      console.log(`❌ Error: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest(); 