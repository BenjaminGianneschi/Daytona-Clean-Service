const express = require('express');
const router = express.Router();
const {
  createReview,
  getPublicReviews,
  getUserReviews,
  getReviewableAppointments,
  canReviewAppointment,
  getAllReviews,
  getPendingReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats,
  getReview
} = require('../controllers/reviewController');
const { auth, requireAdmin } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/public', getPublicReviews); // Obtener reseñas públicas aprobadas

// Rutas para usuarios autenticados
router.post('/', auth, createReview); // Crear reseña
router.get('/user', auth, getUserReviews); // Obtener reseñas del usuario
router.get('/user/reviewable-appointments', auth, getReviewableAppointments); // Turnos que puede reseñar
router.get('/can-review/:appointmentId', auth, canReviewAppointment); // Verificar si puede reseñar
router.delete('/:reviewId', auth, deleteReview); // Eliminar propia reseña

// Rutas para administradores
router.get('/admin/all', requireAdmin, getAllReviews); // Todas las reseñas
router.get('/admin/pending', requireAdmin, getPendingReviews); // Reseñas pendientes
router.get('/admin/stats', requireAdmin, getReviewStats); // Estadísticas
router.get('/admin/:reviewId', requireAdmin, getReview); // Obtener reseña específica
router.put('/admin/:reviewId/status', requireAdmin, updateReviewStatus); // Aprobar/rechazar
router.delete('/admin/:reviewId', requireAdmin, deleteReview); // Eliminar cualquier reseña

module.exports = router; 