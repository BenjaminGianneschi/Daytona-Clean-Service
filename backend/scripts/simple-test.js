const http = require('http');

console.log('🧪 Probando conexión al servidor...');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Servidor responde:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.end(); 