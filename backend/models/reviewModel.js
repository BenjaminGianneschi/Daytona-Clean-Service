// Modelo de Reseñas (Reviews)
const { query } = require('../config/database');

// Crear una nueva reseña
async function createReview(reviewData) {
  const { userId, appointmentId, rating, comment } = reviewData;

  // Verificar que el usuario puede reseñar este turno
  const canReview = await query(
    'SELECT can_user_review_appointment($1, $2) as can_review',
    [userId, appointmentId]
  );

  if (!canReview[0].can_review) {
    throw new Error('No puedes reseñar este turno. Verifica que el turno esté completado y que no hayas reseñado antes.');
  }

  // Crear la reseña
  const result = await query(
    `INSERT INTO reviews (user_id, appointment_id, rating, comment, is_verified, is_approved)
     VALUES ($1, $2, $3, $4, TRUE, FALSE)
     RETURNING id`,
    [userId, appointmentId, rating, comment || null]
  );

  return result[0].id;
}

// Obtener reseñas aprobadas para mostrar en el frontend
async function getApprovedReviews(limit = 10, offset = 0) {
  const reviews = await query(
    `SELECT 
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.name as user_name,
      a.service_type,
      a.appointment_date,
      a.appointment_time,
      a.total_price,
      a.service_location
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN appointments a ON r.appointment_id = a.id
     WHERE r.is_approved = TRUE
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return reviews;
}

// Obtener reseñas de un usuario específico
async function getUserReviews(userId) {
  const reviews = await query(
    `SELECT 
      r.id,
      r.rating,
      r.comment,
      r.is_approved,
      r.created_at,
      a.service_type,
      a.appointment_date,
      a.appointment_time,
      a.total_price,
      a.service_location
     FROM reviews r
     JOIN appointments a ON r.appointment_id = a.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

  return reviews;
}

// Obtener estadísticas de reseñas
async function getReviewStats() {
  const stats = await query('SELECT * FROM get_review_stats()');
  return stats[0];
}

// Obtener todas las reseñas (para administradores)
async function getAllReviews(limit = 50, offset = 0) {
  const reviews = await query(
    `SELECT 
      r.id,
      r.rating,
      r.comment,
      r.is_verified,
      r.is_approved,
      r.created_at,
      u.name as user_name,
      u.email as user_email,
      a.service_type,
      a.appointment_date,
      a.appointment_time,
      a.total_price,
      a.service_location
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN appointments a ON r.appointment_id = a.id
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return reviews;
}

// Aprobar o rechazar una reseña (para administradores)
async function updateReviewStatus(reviewId, isApproved) {
  await query(
    'UPDATE reviews SET is_approved = $1 WHERE id = $2',
    [isApproved, reviewId]
  );
}

// Verificar si un usuario puede reseñar un turno específico
async function canUserReviewAppointment(userId, appointmentId) {
  const result = await query(
    'SELECT can_user_review_appointment($1, $2) as can_review',
    [userId, appointmentId]
  );
  return result[0].can_review;
}

// Obtener turnos completados de un usuario que puede reseñar (solo servicios de vehículos)
async function getCompletedAppointmentsForReview(userId) {
  const appointments = await query(
    `SELECT 
      a.id,
      a.service_type,
      a.appointment_date,
      a.appointment_time,
      a.total_price,
      a.service_location,
      CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as has_review
     FROM appointments a
     LEFT JOIN reviews r ON a.id = r.appointment_id
     WHERE a.user_id = $1 
     AND a.status = 'completed'
     AND a.service_type IN (
       'limpieza-auto',
       'limpieza-pickup', 
       'limpieza-suv',
       'limpieza-detallada-auto',
       'limpieza-detallada-suv',
       'limpieza-detallada-pickup',
       'restauracion-motor'
     )
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [userId]
  );

  return appointments;
}

// Eliminar una reseña (solo el usuario que la creó)
async function deleteReview(reviewId, userId) {
  const result = await query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
    [reviewId, userId]
  );

  if (result.length === 0) {
    throw new Error('No se pudo eliminar la reseña. Verifica que seas el autor.');
  }

  return result[0].id;
}

// Actualizar una reseña (solo el usuario que la creó)
async function updateReview(reviewId, userId, updateData) {
  const { rating, comment } = updateData;

  const result = await query(
    `UPDATE reviews 
     SET rating = $1, comment = $2, is_approved = FALSE, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND user_id = $4
     RETURNING id`,
    [rating, comment || null, reviewId, userId]
  );

  if (result.length === 0) {
    throw new Error('No se pudo actualizar la reseña. Verifica que seas el autor.');
  }

  return result[0].id;
}

module.exports = {
  createReview,
  getApprovedReviews,
  getUserReviews,
  getReviewStats,
  getAllReviews,
  updateReviewStatus,
  canUserReviewAppointment,
  getCompletedAppointmentsForReview,
  deleteReview,
  updateReview
}; 