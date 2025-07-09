// Script de debug para turnos
console.log('🔍 Debug de turnos iniciado');

// Función para verificar el estado actual
function debugTurnos() {
  console.log('=== DEBUG TURNOS ===');
  
  // 1. Verificar si el usuario está logueado
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  console.log('1. Estado de autenticación:');
  console.log('   Token:', token ? '✅ Presente' : '❌ No encontrado');
  console.log('   UserData:', userData ? '✅ Presente' : '❌ No encontrado');
  
  if (userData) {
    const user = JSON.parse(userData);
    console.log('   Usuario:', user);
  }
  
  // 2. Probar la API de turnos del usuario
  if (token) {
    console.log('2. Probando API de turnos...');
    
    fetch('http://localhost:3001/api/appointments/user/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      console.log('   Status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('   Respuesta:', data);
      if (data.success) {
        console.log('   ✅ Turnos encontrados:', data.appointments.length);
        data.appointments.forEach((app, i) => {
          console.log(`   Turno ${i + 1}:`, {
            id: app.id,
            fecha: app.appointment_date,
            hora: app.start_time,
            estado: app.status,
            total: app.total_amount
          });
        });
      } else {
        console.log('   ❌ Error:', data.message);
      }
    })
    .catch(error => {
      console.log('   ❌ Error de red:', error);
    });
  }
  
  // 3. Probar crear un turno de prueba
  console.log('3. Probando crear turno de prueba...');
  
  const testAppointment = {
    clientName: 'Test User',
    clientPhone: '3482123456',
    clientEmail: 'test@test.com',
    appointmentDate: '2024-12-30',
    startTime: '10:00',
    services: [
      {
        name: 'Limpieza Test',
        quantity: 1,
        price: 20000
      }
    ],
    totalAmount: 20000,
    notes: 'Turno de prueba',
    serviceLocation: 'Dirección de prueba'
  };
  
  // Agregar userId si está logueado
  if (userData) {
    const user = JSON.parse(userData);
    testAppointment.userId = user.id;
    console.log('   Agregando userId:', user.id);
  }
  
  console.log('   Datos del turno de prueba:', testAppointment);
  
  fetch('http://localhost:3001/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testAppointment)
  })
  .then(res => {
    console.log('   Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('   Respuesta:', data);
    if (data.success) {
      console.log('   ✅ Turno creado exitosamente');
      // Probar obtener turnos nuevamente
      setTimeout(() => {
        console.log('4. Verificando turnos después de crear...');
        debugTurnos();
      }, 1000);
    } else {
      console.log('   ❌ Error creando turno:', data.message);
    }
  })
  .catch(error => {
    console.log('   ❌ Error de red:', error);
  });
}

// Agregar botón de debug al DOM
document.addEventListener('DOMContentLoaded', function() {
  const debugButton = document.createElement('button');
  debugButton.textContent = '🔍 Debug Turnos';
  debugButton.className = 'btn btn-info';
  debugButton.style.position = 'fixed';
  debugButton.style.top = '20px';
  debugButton.style.right = '20px';
  debugButton.style.zIndex = '9999';
  debugButton.onclick = debugTurnos;
  
  document.body.appendChild(debugButton);
  
  console.log('🔍 Botón de debug agregado. Haz clic para probar.');
});

// Función global
window.debugTurnos = debugTurnos; 