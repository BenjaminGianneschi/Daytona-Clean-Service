const path = require('path');

console.log('🔍 Diagnóstico de errores de pago...\n');

// 1. Verificar importación de mercadopago
console.log('1. Verificando importación de mercadopago...');
try {
  const mercadopago = require('mercadopago');
  console.log('✅ mercadopago importado correctamente');
  console.log('   - Tipo:', typeof mercadopago);
  console.log('   - Métodos disponibles:', Object.keys(mercadopago).slice(0, 10));
  
  if (typeof mercadopago.configure === 'function') {
    console.log('✅ mercadopago.configure es una función');
  } else {
    console.log('❌ mercadopago.configure NO es una función');
    console.log('   - Tipo de configure:', typeof mercadopago.configure);
  }
} catch (error) {
  console.log('❌ Error importando mercadopago:', error.message);
}

console.log('\n2. Verificando importación del logger...');
try {
  const logger = require('../utils/logger');
  console.log('✅ logger importado correctamente');
  console.log('   - Tipo:', typeof logger);
  console.log('   - Métodos disponibles:', Object.keys(logger));
  
  if (typeof logger.error === 'function') {
    console.log('✅ logger.error es una función');
  } else {
    console.log('❌ logger.error NO es una función');
  }
} catch (error) {
  console.log('❌ Error importando logger:', error.message);
}

console.log('\n3. Verificando variables de entorno...');
const requiredEnvVars = [
  'MERCADOPAGO_ACCESS_TOKEN',
  'FRONTEND_URL',
  'BACKEND_URL'
];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Configurado`);
  } else {
    console.log(`❌ ${varName}: No configurado`);
  }
});

console.log('\n4. Verificando estructura de archivos...');
const filesToCheck = [
  '../models/paymentModel.js',
  '../controllers/paymentController.js',
  '../utils/logger.js',
  '../config/database.js'
];

filesToCheck.forEach(filePath => {
  try {
    require(filePath);
    console.log(`✅ ${filePath}: Cargado correctamente`);
  } catch (error) {
    console.log(`❌ ${filePath}: Error al cargar - ${error.message}`);
  }
});

console.log('\n5. Verificando package.json...');
try {
  const packageJson = require('../package.json');
  const hasMercadoPago = packageJson.dependencies && packageJson.dependencies.mercadopago;
  
  if (hasMercadoPago) {
    console.log(`✅ mercadopago en dependencies: ${hasMercadoPago}`);
  } else {
    console.log('❌ mercadopago NO está en dependencies');
  }
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
}

console.log('\n🔍 Diagnóstico completado'); 