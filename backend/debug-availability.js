const fetch = require('node-fetch');

async function debugAvailability() {
  console.log('🔍 Debuggeando disponibilidad...\n');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  try {
    // Probar sin parámetros
    console.log('1. Probando disponibilidad sin parámetros...');
    const response1 = await fetch(`https://daytona-clean-service.onrender.com/api/appointments/availability/${dateStr}`);
    console.log('Status:', response1.status);
    const data1 = await response1.text();
    console.log('Response:', data1);
    console.log('');
    
    // Probar con parámetros
    console.log('2. Probando disponibilidad con parámetros...');
    const response2 = await fetch(`https://daytona-clean-service.onrender.com/api/appointments/availability/${dateStr}?duration=120`);
    console.log('Status:', response2.status);
    const data2 = await response2.text();
    console.log('Response:', data2);
    console.log('');
    
    // Probar con fecha específica (24/7)
    console.log('3. Probando disponibilidad para 24/7...');
    const response3 = await fetch(`https://daytona-clean-service.onrender.com/api/appointments/availability/2025-07-24?duration=120`);
    console.log('Status:', response3.status);
    const data3 = await response3.text();
    console.log('Response:', data3);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAvailability(); 