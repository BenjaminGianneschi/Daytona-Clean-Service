const { query } = require('../config/database');

// Crear una nueva reseña
async function createReview({ userId, appointmentId, rating, comment }) {
  // Validar que el usuario puede reseñar este turno
  const canReview = await query(
    'SELECT can_user_review_appointment($1, $2) as can_review',
    [userId, appointmentId]
  );
  
  if (!canReview[0].can_review) {
    throw new Error('No puedes reseñar este turno. Verifica que esté completado y no tengas una reseña previa.');
  }

  // Validar rating
  if (rating < 1 || rating > 5) {
    throw new Error('El rating debe estar entre 1 y 5');
  }

  // Crear la reseña
  const result = await query(
    `INSERT INTO reviews (user_id, appointment_id, rating, comment, created_at, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id`,
    [userId, appointmentId, rating, comment || null]
  );

  return result[0].id;
}

// Obtener reseña por ID
async function getReviewById(reviewId) {
  const reviews = await query(
    `SELECT r.*, u.name as user_name, a.service_type, a.appointment_date
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN appointments a ON r.appointment_id = a.id
     WHERE r.id = $1`,
    [reviewId]
  );
  
  return reviews[0] || null;
}

// Obtener reseñas públicas (aprobadas)
async function getPublicReviews(limit = 10, offset = 0) {
  const reviews = await query(
    `SELECT r.id, r.rating, r.comment, r.created_at, 
            u.name as user_name, 
            a.service_type, a.appointment_date
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
    `SELECT r.*, a.service_type, a.appointment_date, a.appointment_time
     FROM reviews r
     JOIN appointments a ON r.appointment_id = a.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  
  return reviews;
}

// Obtener todas las reseñas (para admin)
async function getAllReviews(limit = 50, offset = 0) {
  const reviews = await query(
    `SELECT r.*, u.name as user_name, u.email as user_email,
            a.service_type, a.appointment_date, a.appointment_time
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN appointments a ON r.appointment_id = a.id
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return reviews;
}

// Obtener reseñas pendientes de aprobación
async function getPendingReviews() {
  const reviews = await query(
    `SELECT r.*, u.name as user_name, u.email as user_email,
            a.service_type, a.appointment_date, a.appointment_time
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN appointments a ON r.appointment_id = a.id
     WHERE r.is_approved IS NULL
     ORDER BY r.created_at ASC`
  );
  
  return reviews;
}

// Aprobar o rechazar una reseña (admin)
async function updateReviewStatus(reviewId, isApproved) {
  const result = await query(
    'UPDATE reviews SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
    [isApproved, reviewId]
  );
  
  if (result.length === 0) {
    throw new Error('Reseña no encontrada');
  }
  
  return result[0].id;
}

// Eliminar una reseña
async function deleteReview(reviewId, userId = null) {
  let sql = 'DELETE FROM reviews WHERE id = $1';
  let params = [reviewId];
  
  // Si se proporciona userId, verificar que la reseña pertenece al usuario
  if (userId) {
    sql += ' AND user_id = $2';
    params.push(userId);
  }
  
  const result = await query(sql, params);
  
  if (result.rowCount === 0) {
    throw new Error('Reseña no encontrada o no tienes permisos para eliminarla');
  }
  
  return true;
}

// Obtener estadísticas de reseñas
async function getReviewStats() {
  const stats = await query('SELECT * FROM get_review_stats()');
  return stats[0];
}

// Verificar si un usuario puede reseñar un turno específico
async function canUserReviewAppointment(userId, appointmentId) {
  const result = await query(
    'SELECT can_user_review_appointment($1, $2) as can_review',
    [userId, appointmentId]
  );
  
  return result[0].can_review;
}

// Obtener turnos completados de un usuario que puede reseñar
async function getReviewableAppointments(userId) {
  const appointments = await query(
    `SELECT a.id, a.service_type, a.appointment_date, a.appointment_time, a.total_price,
            CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as has_review
     FROM appointments a
     LEFT JOIN reviews r ON a.id = r.appointment_id
     WHERE a.user_id = $1 
       AND a.status = 'completed'
       AND a.service_type IN (
         'limpieza-auto', 'limpieza-pickup', 'limpieza-suv',
         'limpieza-detallada-auto', 'limpieza-detallada-suv', 
         'limpieza-detallada-pickup', 'restauracion-motor'
       )
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [userId]
  );
  
  return appointments;
}

module.exports = {
  createReview,
  getReviewById,
  getPublicReviews,
  getUserReviews,
  getAllReviews,
  getPendingReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats,
  canUserReviewAppointment,
  getReviewableAppointments
}; 