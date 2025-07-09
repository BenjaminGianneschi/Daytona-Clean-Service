const fetch = require('node-fetch');

async function testProfileUpdate() {
  try {
    console.log('🧪 Probando actualización de perfil...');
    
    // Primero necesitamos obtener un token válido
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'benjamingianneschi5@gmail.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }
    
    console.log('✅ Login exitoso, token obtenido');
    const token = loginData.token;
    
    // Probar actualización de perfil
    const updateResponse = await fetch('http://localhost:3001/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'benjamingianneschi5@gmail.com',
        phone: '3482625005',
        currentPassword: 'admin123',
        newPassword: 'admin123'
      })
    });
    
    const updateData = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Actualización exitosa:', updateData);
    } else {
      console.error('❌ Error en actualización:', updateData);
      console.log('Status:', updateResponse.status);
      console.log('Status Text:', updateResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testProfileUpdate(); 