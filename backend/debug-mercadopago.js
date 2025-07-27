require('dotenv').config();

console.log('🔍 Diagnóstico de Mercado Pago');
console.log('================================');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('- MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || '❌ No configurado');
console.log('- BACKEND_URL:', process.env.BACKEND_URL || '❌ No configurado');

// Verificar instalación de mercadopago
console.log('\n📦 Verificando instalación de mercadopago...');
try {
  const mercadopago = require('mercadopago');
  console.log('✅ mercadopago importado correctamente');
  console.log('- Versión:', require('mercadopago/package.json').version);
  console.log('- Tipo:', typeof mercadopago);
  
  // Verificar métodos disponibles
  console.log('\n🔧 Métodos disponibles:');
  console.log('- configure:', typeof mercadopago.configure);
  console.log('- preferences:', typeof mercadopago.preferences);
  console.log('- payment:', typeof mercadopago.payment);
  
  // Intentar configurar
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.log('\n⚙️ Intentando configurar Mercado Pago...');
    try {
      mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
      });
      console.log('✅ Configuración exitosa');
      
      // Probar creación de preferencia
      console.log('\n🧪 Probando creación de preferencia...');
      const testPreference = {
        items: [
          {
            title: 'Test Service',
            unit_price: 100,
            quantity: 1
          }
        ],
        back_urls: {
          success: 'https://example.com/success',
          failure: 'https://example.com/failure'
        }
      };
      
      const response = await mercadopago.preferences.create(testPreference);
      console.log('✅ Preferencia creada exitosamente');
      console.log('- Preference ID:', response.body.id);
      console.log('- Init Point:', response.body.init_point);
      
    } catch (configError) {
      console.error('❌ Error en configuración:', configError.message);
      console.error('Stack:', configError.stack);
    }
  } else {
    console.log('⚠️ No se puede probar configuración sin ACCESS_TOKEN');
  }
  
} catch (importError) {
  console.error('❌ Error importando mercadopago:', importError.message);
  console.error('Stack:', importError.stack);
}

console.log('\n🏁 Diagnóstico completado'); 