const express = require('express');
const router = express.Router();
const {
  createPaymentPreference,
  processWebhook,
  getPayment,
  getAppointmentByPreference,
  getPaymentByAppointment,
  getUserPayments,
  getAllPayments,
  getPaymentStats,
  checkPaymentStatus,
  createCashPayment,
  getPaymentMethods,
  refundPayment
} = require('../controllers/paymentController');
const { auth, requireAdmin } = require('../middleware/auth');

// Ruta de prueba para verificar variables de entorno
router.get('/test-config', (req, res) => {
  res.json({
    success: true,
    data: {
      hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      hasPublicKey: !!process.env.MERCADOPAGO_PUBLIC_KEY,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
      hasBackendUrl: !!process.env.BACKEND_URL,
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN ? process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...' : 'N/A',
      frontendUrl: process.env.FRONTEND_URL || 'N/A',
      backendUrl: process.env.BACKEND_URL || 'N/A'
    }
  });
});

// Ruta de prueba para verificar configuración de Mercado Pago
router.get('/test-mercadopago', async (req, res) => {
  try {
    const mercadopago = require('mercadopago');
    
    // Verificar si mercadopago está disponible
    if (!mercadopago) {
      return res.json({
        success: false,
        error: 'mercadopago no está disponible'
      });
    }

    // Verificar si configure está disponible
    if (typeof mercadopago.configure !== 'function') {
      return res.json({
        success: false,
        error: 'mercadopago.configure no es una función',
        mercadopagoType: typeof mercadopago,
        availableMethods: Object.keys(mercadopago)
      });
    }

    // Intentar configurar
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      mercadopago.configure({
        access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
      });
      
      return res.json({
        success: true,
        message: 'Mercado Pago configurado correctamente',
        hasAccessToken: true,
        accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...'
      });
    } else {
      return res.json({
        success: false,
        error: 'MERCADOPAGO_ACCESS_TOKEN no está configurado'
      });
    }
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Ruta para reiniciar caché
router.get('/reset-cache', (req, res) => {
  console.log('🔄 Reiniciando caché de pagos...');
  // Forzar garbage collection si está disponible
  if (global.gc) {
    global.gc();
  }
  res.json({ success: true, message: 'Caché de pagos reiniciado' });
});

// Rutas públicas (sin autenticación)
router.post('/webhook', processWebhook); // Webhook de Mercado Pago
router.get('/methods', getPaymentMethods); // Métodos de pago disponibles
router.get('/preference/:preferenceId', getAppointmentByPreference); // Obtener turno por preference_id

// Rutas para usuarios autenticados
router.post('/create-preference', auth, createPaymentPreference); // Crear preferencia de pago (con autenticación)
router.post('/create-preference-public', createPaymentPreference); // Crear preferencia de pago (sin autenticación)
router.get('/user', auth, getUserPayments); // Obtener pagos del usuario
router.get('/appointment/:appointmentId', auth, getPaymentByAppointment); // Obtener pago por turno
router.get('/status/:paymentId', auth, checkPaymentStatus); // Verificar estado de pago

// Rutas para administradores
router.get('/admin/all', requireAdmin, getAllPayments); // Todos los pagos
router.get('/admin/stats', requireAdmin, getPaymentStats); // Estadísticas
router.get('/admin/:paymentId', requireAdmin, getPayment); // Obtener pago específico
router.post('/admin/cash-payment', requireAdmin, createCashPayment); // Crear pago en efectivo
router.post('/admin/:paymentId/refund', requireAdmin, refundPayment); // Reembolsar pago

module.exports = router; 