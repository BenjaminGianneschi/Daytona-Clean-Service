const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(auth);

// Obtener notificaciones del usuario
router.get('/user', notificationController.getUserNotifications);

// Obtener notificaciones no leídas
router.get('/unread', notificationController.getUnreadNotifications);

// Contar notificaciones no leídas
router.get('/count', notificationController.countUnreadNotifications);

// Marcar notificación como leída
router.put('/:id/read', notificationController.markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', notificationController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', notificationController.deleteNotification);

// Limpiar notificaciones antiguas (solo admin)
router.delete('/cleanup', notificationController.cleanupOldNotifications);

module.exports = router; 