// Rutas de Reseñas (Reviews)
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// ===== RUTAS PÚBLICAS =====

// GET /api/reviews - Obtener reseñas aprobadas (público)
router.get('/', reviewController.getApprovedReviews);

// ===== RUTAS PARA USUARIOS AUTENTICADOS =====

// POST /api/reviews - Crear nueva reseña (requiere autenticación)
router.post('/', auth, reviewController.createReview);

// GET /api/reviews/user - Obtener reseñas del usuario autenticado
router.get('/user', auth, reviewController.getUserReviews);

// GET /api/reviews/appointments - Obtener turnos completados que puede reseñar
router.get('/appointments', auth, reviewController.getCompletedAppointmentsForReview);

// PUT /api/reviews/:reviewId - Actualizar reseña del usuario
router.put('/:reviewId', auth, reviewController.updateReview);

// DELETE /api/reviews/:reviewId - Eliminar reseña del usuario
router.delete('/:reviewId', auth, reviewController.deleteReview);

// ===== RUTAS DE ADMINISTRADOR =====

// GET /api/reviews/admin/all - Obtener todas las reseñas (admin)
router.get('/admin/all', adminAuth, reviewController.getAllReviews);

// PUT /api/reviews/admin/:reviewId/status - Aprobar/rechazar reseña (admin)
router.put('/admin/:reviewId/status', adminAuth, reviewController.updateReviewStatus);

// GET /api/reviews/admin/stats - Obtener estadísticas de reseñas (admin)
router.get('/admin/stats', adminAuth, reviewController.getReviewStats);

module.exports = router; 