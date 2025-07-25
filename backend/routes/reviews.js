// Rutas de Reseñas (Reviews)
const express = require('express');
const router = express.Router();
const {
  createReview,
  getApprovedReviews,
  getUserReviews,
  getCompletedAppointmentsForReview,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
  getReviewStats
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Debug: verificar que los controladores son funciones
console.log('createReview:', typeof createReview);
console.log('getApprovedReviews:', typeof getApprovedReviews);
console.log('auth middleware:', typeof auth);
console.log('adminAuth middleware:', typeof adminAuth);

// ===== RUTAS PÚBLICAS =====

// GET /api/reviews - Obtener reseñas aprobadas (público)
router.get('/', getApprovedReviews);

// ===== RUTAS PARA USUARIOS AUTENTICADOS =====

// POST /api/reviews - Crear nueva reseña (requiere autenticación)
router.post('/', auth, createReview);

// GET /api/reviews/user - Obtener reseñas del usuario autenticado
router.get('/user', auth, getUserReviews);

// GET /api/reviews/appointments - Obtener turnos completados que puede reseñar
router.get('/appointments', auth, getCompletedAppointmentsForReview);

// PUT /api/reviews/:reviewId - Actualizar reseña del usuario
router.put('/:reviewId', auth, updateReview);

// DELETE /api/reviews/:reviewId - Eliminar reseña del usuario
router.delete('/:reviewId', auth, deleteReview);

// ===== RUTAS DE ADMINISTRADOR =====

// GET /api/reviews/admin/all - Obtener todas las reseñas (admin)
router.get('/admin/all', adminAuth, getAllReviews);

// PUT /api/reviews/admin/:reviewId/status - Aprobar/rechazar reseña (admin)
router.put('/admin/:reviewId/status', adminAuth, updateReviewStatus);

// GET /api/reviews/admin/stats - Obtener estadísticas de reseñas (admin)
router.get('/admin/stats', adminAuth, getReviewStats);

module.exports = router; 