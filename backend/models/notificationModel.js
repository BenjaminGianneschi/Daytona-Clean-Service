const { query } = require('../config/database');

// Crear una nueva notificación
async function createNotification(notificationData) {
  const { user_id, appointment_id, type, title, message } = notificationData;
  
  const result = await query(
    `INSERT INTO notifications (user_id, appointment_id, type, title, message, created_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING id`,
    [user_id, appointment_id, type, title, message]
  );
  
  return result[0].id;
}

// Obtener notificaciones de un usuario
async function getUserNotifications(userId, limit = 50) {
  const notifications = await query(
    `SELECT 
       n.*,
       a.appointment_date,
       a.appointment_time,
       a.service_type,
       a.client_name
     FROM notifications n
     LEFT JOIN appointments a ON n.appointment_id = a.id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  
  return notifications;
}

// Obtener notificaciones no leídas de un usuario
async function getUnreadNotifications(userId) {
  const notifications = await query(
    `SELECT 
       n.*,
       a.appointment_date,
       a.appointment_time,
       a.service_type,
       a.client_name
     FROM notifications n
     LEFT JOIN appointments a ON n.appointment_id = a.id
     WHERE n.user_id = $1 AND n.is_read = FALSE
     ORDER BY n.created_at DESC`,
    [userId]
  );
  
  return notifications;
}

// Contar notificaciones no leídas
async function countUnreadNotifications(userId) {
  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  
  return parseInt(result[0].count);
}

// Marcar notificación como leída
async function markAsRead(notificationId) {
  await query(
    'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1',
    [notificationId]
  );
}

// Marcar todas las notificaciones de un usuario como leídas
async function markAllAsRead(userId) {
  await query(
    'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
}

// Eliminar notificación
async function deleteNotification(notificationId) {
  await query('DELETE FROM notifications WHERE id = $1', [notificationId]);
}

// Eliminar notificaciones antiguas (más de 30 días)
async function cleanupOldNotifications() {
  await query(
    'DELETE FROM notifications WHERE created_at < CURRENT_TIMESTAMP - INTERVAL \'30 days\'',
    []
  );
}

// Crear notificación de confirmación de turno
async function createConfirmationNotification(appointment) {
  const title = '✅ Turno Confirmado';
  const message = `Tu turno del ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.appointment_time} ha sido confirmado. ¡Te esperamos!`;
  
  return await createNotification({
    user_id: appointment.user_id,
    appointment_id: appointment.id,
    type: 'confirmation',
    title,
    message
  });
}

// Crear notificación de cancelación de turno
async function createCancellationNotification(appointment, reason = 'Cancelado por el administrador') {
  const title = '❌ Turno Cancelado';
  const message = `Tu turno del ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.appointment_time} ha sido cancelado. Motivo: ${reason}`;
  
  return await createNotification({
    user_id: appointment.user_id,
    appointment_id: appointment.id,
    type: 'cancellation',
    title,
    message
  });
}

// Crear notificación de recordatorio
async function createReminderNotification(appointment) {
  const title = '⏰ Recordatorio de Turno';
  const message = `Recordatorio: Tu turno es mañana ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.appointment_time}. ¡No te olvides!`;
  
  return await createNotification({
    user_id: appointment.user_id,
    appointment_id: appointment.id,
    type: 'reminder',
    title,
    message
  });
}

// Crear notificación de reprogramación
async function createRescheduleNotification(appointment, newDate, newTime) {
  const title = '🔄 Turno Reprogramado';
  const message = `Tu turno ha sido reprogramado para el ${new Date(newDate).toLocaleDateString('es-AR')} a las ${newTime}. ¡Gracias por tu paciencia!`;
  
  return await createNotification({
    user_id: appointment.user_id,
    appointment_id: appointment.id,
    type: 'reschedule',
    title,
    message
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  countUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications,
  createConfirmationNotification,
  createCancellationNotification,
  createReminderNotification,
  createRescheduleNotification
}; 