// Controlador de Reseñas (Reviews)
const reviewModel = require('../models/reviewModel');

// Crear una nueva reseña
const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación

    // Validaciones
    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'El ID del turno y la calificación son obligatorios'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Verificar que el usuario puede reseñar este turno
    const canReview = await reviewModel.canUserReviewAppointment(userId, appointmentId);
    if (!canReview) {
      return res.status(403).json({
        success: false,
        message: 'No puedes reseñar este turno. Verifica que el turno esté completado y que no hayas reseñado antes.'
      });
    }

    // Crear la reseña
    const reviewId = await reviewModel.createReview({
      userId,
      appointmentId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente. Será revisada por nuestro equipo antes de ser publicada.',
      reviewId
    });

  } catch (error) {
    console.error('Error creando reseña:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// Obtener reseñas aprobadas (público)
const getApprovedReviews = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const reviews = await reviewModel.getApprovedReviews(parseInt(limit), parseInt(offset));
    const stats = await reviewModel.getReviewStats();

    res.json({
      success: true,
      data: {
        reviews,
        stats
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener reseñas del usuario autenticado
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await reviewModel.getUserReviews(userId);

    res.json({
      success: true,
      reviews: reviews
    });

  } catch (error) {
    console.error('Error obteniendo reseñas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener turnos completados que el usuario puede reseñar
const getCompletedAppointmentsForReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await reviewModel.getCompletedAppointmentsForReview(userId);

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error obteniendo turnos para reseñar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar una reseña del usuario
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    await reviewModel.updateReview(reviewId, userId, { rating, comment });

    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente. Será revisada nuevamente por nuestro equipo.'
    });

  } catch (error) {
    console.error('Error actualizando reseña:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// Eliminar una reseña del usuario
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    await reviewModel.deleteReview(reviewId, userId);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

// ===== FUNCIONES DE ADMINISTRADOR =====

// Obtener todas las reseñas (admin)
const getAllReviews = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const reviews = await reviewModel.getAllReviews(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      reviews: reviews
    });

  } catch (error) {
    console.error('Error obteniendo todas las reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Aprobar o rechazar una reseña (admin)
const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo isApproved debe ser un booleano'
      });
    }

    await reviewModel.updateReviewStatus(reviewId, isApproved);

    res.json({
      success: true,
      message: `Reseña ${isApproved ? 'aprobada' : 'rechazada'} exitosamente`
    });

  } catch (error) {
    console.error('Error actualizando estado de reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de reseñas (admin)
const getReviewStats = async (req, res) => {
  try {
    const stats = await reviewModel.getReviewStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  // Funciones públicas
  createReview,
  getApprovedReviews,
  
  // Funciones para usuarios autenticados
  getUserReviews,
  getCompletedAppointmentsForReview,
  updateReview,
  deleteReview,
  
  // Funciones de administrador
  getAllReviews,
  updateReviewStatus,
  getReviewStats
}; 