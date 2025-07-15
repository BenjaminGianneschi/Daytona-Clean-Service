const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  completeAppointment,
  getUserAppointments,
  updateUserAppointment,
  cancelUserAppointment,
  getAllServices,
  sendManualReminder
} = require('../controllers/appointmentController');
const { authenticateUserToken, requireAdmin } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.get('/availability/:date', getAvailability);
router.post('/', createAppointment); // Permitir crear turno sin autenticación

// Obtener todos los servicios
router.get('/services', getAllServices);

// Rutas para usuarios logueados
router.get('/user/appointments', authenticateUserToken, getUserAppointments);
router.put('/users/appointments/:id', authenticateUserToken, updateUserAppointment);
router.post('/users/appointments/:id/cancel', authenticateUserToken, cancelUserAppointment);

// Rutas protegidas (para administradores) - se usarán desde el perfil de usuario
router.get('/admin/all', requireAdmin, getAllAppointments);
router.get('/admin/:id', requireAdmin, getAppointment);
router.put('/admin/:id/status', requireAdmin, updateAppointmentStatus);
router.put('/admin/:id/cancel', requireAdmin, cancelAppointment);
router.put('/admin/:id/complete', requireAdmin, completeAppointment);
router.post('/admin/:id/reminder', requireAdmin, sendManualReminder);

module.exports = router; 