// Script de prueba para verificar la conexión con el backend
class ConnectionTester {
  constructor() {
    this.results = [];
  }

  async testConnection() {
    console.log('🔍 Iniciando pruebas de conexión...');
    
    try {
      // Obtener la URL de la API
      const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-backend.onrender.com/api';
      console.log('📍 URL de la API:', apiUrl);
      
      // Test 1: Health Check
      await this.testHealthCheck(apiUrl);
      
      // Test 2: Verificar CORS
      await this.testCORS(apiUrl);
      
      // Test 3: Verificar autenticación
      await this.testAuth(apiUrl);
      
      // Mostrar resultados
      this.showResults();
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
    }
  }

  async testHealthCheck(apiUrl) {
    try {
      console.log('🏥 Probando Health Check...');
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.addResult('Health Check', '✅ Exitoso', data);
        console.log('✅ Health Check exitoso:', data);
      } else {
        this.addResult('Health Check', '❌ Falló', data);
        console.error('❌ Health Check falló:', data);
      }
    } catch (error) {
      this.addResult('Health Check', '❌ Error de red', error.message);
      console.error('❌ Error en Health Check:', error);
    }
  }

  async testCORS(apiUrl) {
    try {
      console.log('🌐 Probando CORS...');
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.addResult('CORS', '✅ Configurado correctamente', 'Las peticiones CORS funcionan');
        console.log('✅ CORS configurado correctamente');
      } else {
        this.addResult('CORS', '❌ Problema de CORS', `Status: ${response.status}`);
        console.error('❌ Problema de CORS:', response.status);
      }
    } catch (error) {
      this.addResult('CORS', '❌ Error de CORS', error.message);
      console.error('❌ Error de CORS:', error);
    }
  }

  async testAuth(apiUrl) {
    try {
      console.log('🔐 Probando endpoints de autenticación...');
      const response = await fetch(`${apiUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        this.addResult('Autenticación', '✅ Endpoint protegido', 'El endpoint requiere autenticación (correcto)');
        console.log('✅ Endpoint de autenticación protegido correctamente');
      } else {
        this.addResult('Autenticación', '⚠️ Verificar protección', `Status: ${response.status}`);
        console.warn('⚠️ Verificar protección del endpoint:', response.status);
      }
    } catch (error) {
      this.addResult('Autenticación', '❌ Error', error.message);
      console.error('❌ Error en autenticación:', error);
    }
  }

  addResult(test, status, details) {
    this.results.push({
      test,
      status,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  showResults() {
    console.log('\n📊 RESULTADOS DE LAS PRUEBAS:');
    console.log('================================');
    
    this.results.forEach(result => {
      console.log(`${result.status} ${result.test} - ${result.timestamp}`);
      if (typeof result.details === 'object') {
        console.log('   Detalles:', JSON.stringify(result.details, null, 2));
      } else {
        console.log('   Detalles:', result.details);
      }
    });
    
    const successCount = this.results.filter(r => r.status.includes('✅')).length;
    const totalCount = this.results.length;
    
    console.log('\n📈 RESUMEN:');
    console.log(`✅ Exitosos: ${successCount}/${totalCount}`);
    console.log(`❌ Fallidos: ${totalCount - successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
      console.log('🎉 ¡Todas las pruebas pasaron! El backend está funcionando correctamente.');
    } else {
      console.log('⚠️ Algunas pruebas fallaron. Revisa la configuración.');
    }
  }
}

// Función global para ejecutar las pruebas
window.testBackendConnection = function() {
  const tester = new ConnectionTester();
  tester.testConnection();
};

// Ejecutar automáticamente si estamos en modo debug
if (window.location.search.includes('debug=true')) {
  console.log('🔧 Modo debug detectado, ejecutando pruebas automáticamente...');
  window.testBackendConnection();
}

// Agregar botón de prueba en la consola
console.log('🔧 Para probar la conexión, ejecuta: testBackendConnection()'); 