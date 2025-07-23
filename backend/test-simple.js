const fetch = require('node-fetch');

async function testEndpoints() {
  console.log('🧪 Test simple de endpoints...\n');
  
  const baseURL = 'https://daytona-clean-service.onrender.com/api';
  
  try {
    // 1. Test health check
    console.log('1. Probando health check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    console.log('Status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);
    console.log('');
    
    // 2. Test servicios
    console.log('2. Probando endpoint de servicios...');
    const servicesResponse = await fetch(`${baseURL}/services`);
    console.log('Status:', servicesResponse.status);
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log('Servicios:', servicesData);
    } else {
      const errorText = await servicesResponse.text();
      console.log('Error:', errorText);
    }
    console.log('');
    
    // 3. Test disponibilidad
    console.log('3. Probando disponibilidad...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availabilityResponse = await fetch(`${baseURL}/appointments/availability/${dateStr}?duration=120`);
    console.log('Status:', availabilityResponse.status);
    if (availabilityResponse.ok) {
      const availabilityData = await availabilityResponse.json();
      console.log('Disponibilidad:', availabilityData);
    } else {
      const errorText = await availabilityResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testEndpoints(); 