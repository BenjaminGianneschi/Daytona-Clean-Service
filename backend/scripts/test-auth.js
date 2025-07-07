const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Configurar para usar PostgreSQL
process.env.DB_TYPE = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'daytona_turnos';
process.env.DB_PORT = '5432';

async function testAuth() {
  try {
    console.log('🔍 Probando autenticación...');
    
    // 1. Probar endpoint de debug sin autenticación
    console.log('\n1️⃣ Probando sin autenticación:');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/debug-auth`);
      console.log('✅ Respuesta:', response.data);
    } catch (error) {
      console.log('❌ Error esperado:', error.response?.data || error.message);
    }
    
    // 2. Probar login
    console.log('\n2️⃣ Probando login:');
    const loginData = {
      email: 'test@daytona.com',
      password: 'password123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      console.log('✅ Login exitoso:', loginResponse.data);
      
      const token = loginResponse.data.token;
      
      // 3. Probar endpoint de debug con token
      console.log('\n3️⃣ Probando con token JWT:');
      const authResponse = await axios.get(`${API_BASE_URL}/users/debug-auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Respuesta con token:', authResponse.data);
      
      // 4. Probar endpoint de turnos con token
      console.log('\n4️⃣ Probando endpoint de turnos:');
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/users/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Turnos obtenidos:', appointmentsResponse.data);
      
    } catch (loginError) {
      console.log('❌ Error en login:', loginError.response?.data || loginError.message);
      
      // Si el login falla, probar con credenciales diferentes
      console.log('\n🔄 Probando con credenciales alternativas...');
      
      const alternativeLogins = [
        { email: 'admin@daytona.com', password: 'admin123' },
        { email: 'usuario@daytona.com', password: 'password123' },
        { email: 'test@example.com', password: 'test123' }
      ];
      
      for (const creds of alternativeLogins) {
        try {
          console.log(`\n🔍 Probando: ${creds.email}`);
          const altLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, creds);
          console.log('✅ Login exitoso con credenciales alternativas:', altLoginResponse.data);
          break;
        } catch (altError) {
          console.log(`❌ Falló: ${altError.response?.data?.message || altError.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testAuth()
    .then(() => {
      console.log('\n🎉 Prueba de autenticación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { testAuth }; 