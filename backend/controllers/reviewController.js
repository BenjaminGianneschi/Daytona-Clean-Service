const reviewModel = require('../models/reviewModel');
const { logger } = require('../utils/logger');

// Crear una nueva reseña
async function createReview(req, res) {
  try {
    const { appointmentId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validaciones básicas
    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId y rating son obligatorios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'El rating debe estar entre 1 y 5'
      });
    }

    // Crear la reseña
    const reviewId = await reviewModel.createReview({
      userId,
      appointmentId,
      rating,
      comment
    });

    logger.info(`Reseña creada: ID ${reviewId} por usuario ${userId} para turno ${appointmentId}`);

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: { reviewId }
    });

  } catch (error) {
    logger.error('Error al crear reseña:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener reseñas públicas (aprobadas)
async function getPublicReviews(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const reviews = await reviewModel.getPublicReviews(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    logger.error('Error al obtener reseñas públicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener reseñas del usuario logueado
async function getUserReviews(req, res) {
  try {
    const userId = req.user.id;
    const reviews = await reviewModel.getUserReviews(userId);

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    logger.error('Error al obtener reseñas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener turnos que el usuario puede reseñar
async function getReviewableAppointments(req, res) {
  try {
    const userId = req.user.id;
    const appointments = await reviewModel.getReviewableAppointments(userId);

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    logger.error('Error al obtener turnos reseñables:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Verificar si un usuario puede reseñar un turno específico
async function canReviewAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const canReview = await reviewModel.canUserReviewAppointment(userId, appointmentId);

    res.json({
      success: true,
      data: { canReview }
    });

  } catch (error) {
    logger.error('Error al verificar si puede reseñar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todas las reseñas (admin)
async function getAllReviews(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const reviews = await reviewModel.getAllReviews(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    logger.error('Error al obtener todas las reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener reseñas pendientes de aprobación (admin)
async function getPendingReviews(req, res) {
  try {
    const reviews = await reviewModel.getPendingReviews();

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    logger.error('Error al obtener reseñas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Aprobar o rechazar una reseña (admin)
async function updateReviewStatus(req, res) {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isApproved debe ser true o false'
      });
    }

    await reviewModel.updateReviewStatus(reviewId, isApproved);

    logger.info(`Reseña ${reviewId} ${isApproved ? 'aprobada' : 'rechazada'} por admin ${req.user.id}`);

    res.json({
      success: true,
      message: `Reseña ${isApproved ? 'aprobada' : 'rechazada'} exitosamente`
    });

  } catch (error) {
    logger.error('Error al actualizar estado de reseña:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Eliminar una reseña (usuario o admin)
async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Solo el admin puede eliminar reseñas de otros usuarios
    const targetUserId = isAdmin ? null : userId;

    await reviewModel.deleteReview(reviewId, targetUserId);

    logger.info(`Reseña ${reviewId} eliminada por ${isAdmin ? 'admin' : 'usuario'} ${userId}`);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    logger.error('Error al eliminar reseña:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener estadísticas de reseñas (admin)
async function getReviewStats(req, res) {
  try {
    const stats = await reviewModel.getReviewStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error al obtener estadísticas de reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener una reseña específica
async function getReview(req, res) {
  try {
    const { reviewId } = req.params;
    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    logger.error('Error al obtener reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

module.exports = {
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
}; 