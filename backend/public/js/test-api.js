// Script de prueba para verificar la conectividad de la API
console.log('🔍 Iniciando pruebas de conectividad de la API...');

// Función para probar la conectividad
async function testApiConnectivity() {
  try {
    // Obtener la URL de la API
    const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
    console.log('📍 URL de la API:', apiUrl);
    
    // Probar endpoint de CORS
    console.log('🔧 Probando endpoint de CORS...');
    const corsResponse = await fetch(`${apiUrl}/test-cors`);
    const corsData = await corsResponse.json();
    console.log('✅ Respuesta de CORS:', corsData);
    
    // Probar endpoint de salud
    console.log('🏥 Probando endpoint de salud...');
    const healthResponse = await fetch(`${apiUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Respuesta de salud:', healthData);
    
    // Probar endpoint de registro (solo verificar que existe)
    console.log('👤 Probando endpoint de registro...');
    const registerResponse = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        phone: '123456789',
        password: 'test123'
      })
    });
    
    console.log('📊 Status del registro:', registerResponse.status);
    console.log('📋 Headers de respuesta:', Object.fromEntries(registerResponse.headers.entries()));
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Respuesta de registro:', registerData);
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ Error de registro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Página cargada, ejecutando pruebas...');
  testApiConnectivity();
});

// También ejecutar inmediatamente si ya está cargado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testApiConnectivity);
} else {
  testApiConnectivity();
} 