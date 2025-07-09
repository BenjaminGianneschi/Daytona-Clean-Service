const http = require('http');

// Función para hacer una petición HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testProfileUpdate() {
  try {
    console.log('🧪 Probando actualización de perfil...');
    
    // Primero hacer login para obtener token
    const loginData = {
      email: 'benjamingianneschi5@gmail.com',
      password: 'admin123'
    };
    
    console.log('📝 Intentando login...');
    const loginResult = await makeRequest('POST', '/api/auth/login', loginData);
    console.log('Login result:', loginResult);
    
    if (loginResult.status !== 200 || !loginResult.data.success) {
      console.error('❌ Error en login');
      return;
    }
    
    const token = loginResult.data.token;
    console.log('✅ Token obtenido');
    
    // Probar actualización de perfil
    const updateData = {
      email: 'benjamingianneschi5@gmail.com',
      phone: '3482625005',
      currentPassword: 'admin123',
      newPassword: 'admin123'
    };
    
    console.log('📝 Intentando actualizar perfil...');
    const updateResult = await makeRequest('PUT', '/api/users/profile', updateData, token);
    console.log('Update result:', updateResult);
    
    if (updateResult.status === 200) {
      console.log('✅ Actualización exitosa');
    } else {
      console.error('❌ Error en actualización');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testProfileUpdate(); 