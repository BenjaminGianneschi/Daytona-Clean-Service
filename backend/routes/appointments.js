const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment
} = require('../controllers/appointmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.get('/availability/:date', getAvailability);
router.post('/', createAppointment);

// Rutas protegidas (para administradores)
router.get('/', authenticateToken, requireAdmin, getAllAppointments);
router.get('/:id', authenticateToken, requireAdmin, getAppointment);
router.put('/:id/status', authenticateToken, requireAdmin, updateAppointmentStatus);
router.put('/:id/cancel', authenticateToken, requireAdmin, cancelAppointment);

module.exports = router; 