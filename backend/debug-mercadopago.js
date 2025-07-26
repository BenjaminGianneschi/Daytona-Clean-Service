// Script para diagnosticar Mercado Pago
const mercadopago = require('mercadopago');

console.log('🔍 Diagnóstico de Mercado Pago...\n');

// 1. Verificar variables de entorno
console.log('1. Variables de entorno:');
console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('MERCADOPAGO_PUBLIC_KEY:', process.env.MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ No configurado');

if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.log('   Token (primeros 10 chars):', process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...');
}
if (process.env.MERCADOPAGO_PUBLIC_KEY) {
  console.log('   Public Key:', process.env.MERCADOPAGO_PUBLIC_KEY);
}

// 2. Intentar configurar Mercado Pago
console.log('\n2. Configurando Mercado Pago...');
try {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
  console.log('✅ Mercado Pago configurado correctamente');
} catch (error) {
  console.error('❌ Error configurando Mercado Pago:', error.message);
  process.exit(1);
}

// 3. Probar creación de preferencia simple
console.log('\n3. Probando creación de preferencia...');
async function testPreference() {
  try {
    const preference = {
      items: [
        {
          title: 'Test Item',
          unit_price: 100,
          quantity: 1,
        }
      ],
      back_urls: {
        success: "https://daytona-clean-service.onrender.com/payment-success.html",
        failure: "https://daytona-clean-service.onrender.com/payment-failure.html",
        pending: "https://daytona-clean-service.onrender.com/payment-pending.html"
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    console.log('✅ Preferencia creada exitosamente');
    console.log('   Preference ID:', response.body.id);
    console.log('   Init Point:', response.body.init_point);
    return response.body;
  } catch (error) {
    console.error('❌ Error creando preferencia:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return null;
  }
}

testPreference().then(() => {
  console.log('\n🎉 Diagnóstico completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error en diagnóstico:', error);
  process.exit(1);
}); 