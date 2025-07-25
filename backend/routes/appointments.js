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
const { auth, requireAdmin } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.get('/availability/:date', getAvailability);
router.post('/', createAppointment); // Permitir crear turno sin autenticación

// Obtener todos los servicios
router.get('/services', getAllServices);

// Rutas para usuarios logueados
router.get('/user/appointments', auth, getUserAppointments);
router.put('/users/appointments/:id', auth, updateUserAppointment);
router.post('/users/appointments/:id/cancel', auth, cancelUserAppointment);

// Rutas protegidas (para administradores) - se usarán desde el perfil de usuario
router.get('/admin/all', requireAdmin, getAllAppointments);
router.get('/admin/:id', requireAdmin, getAppointment);
router.put('/admin/:id/status', requireAdmin, updateAppointmentStatus);
router.put('/admin/:id/cancel', requireAdmin, cancelAppointment);
router.put('/admin/:id/complete', requireAdmin, completeAppointment);
router.post('/admin/:id/reminder', requireAdmin, sendManualReminder);

module.exports = router; 