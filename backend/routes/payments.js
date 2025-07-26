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
      accessTokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN ? process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 4) : 'N/A'
    }
  });
});

// Rutas públicas (sin autenticación)
router.post('/webhook', processWebhook); // Webhook de Mercado Pago
router.get('/methods', getPaymentMethods); // Métodos de pago disponibles
router.get('/preference/:preferenceId', getAppointmentByPreference); // Obtener turno por preference_id

// Rutas para usuarios autenticados
router.post('/create-preference', auth, createPaymentPreference); // Crear preferencia de pago
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