const notificationModel = require('../models/notificationModel');

// Obtener notificaciones del usuario
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationModel.getUserNotifications(userId);
    
    res.json({ 
      success: true, 
      notifications,
      message: 'Notificaciones obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener notificaciones no leídas
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationModel.getUnreadNotifications(userId);
    
    res.json({ 
      success: true, 
      notifications,
      message: 'Notificaciones no leídas obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones no leídas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Contar notificaciones no leídas
const countUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationModel.countUnreadNotifications(userId);
    
    res.json({ 
      success: true, 
      count,
      message: 'Contador de notificaciones obtenido correctamente'
    });
  } catch (error) {
    console.error('Error contando notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la notificación pertenece al usuario
    const notifications = await notificationModel.getUserNotifications(userId);
    const notification = notifications.find(n => n.id == id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    
    await notificationModel.markAsRead(id);
    
    res.json({ 
      success: true, 
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationModel.markAllAsRead(userId);
    
    res.json({ 
      success: true, 
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Eliminar notificación
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la notificación pertenece al usuario
    const notifications = await notificationModel.getUserNotifications(userId);
    const notification = notifications.find(n => n.id == id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    
    await notificationModel.deleteNotification(id);
    
    res.json({ 
      success: true, 
      message: 'Notificación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Limpiar notificaciones antiguas (admin)
const cleanupOldNotifications = async (req, res) => {
  try {
    await notificationModel.cleanupOldNotifications();
    
    res.json({ 
      success: true, 
      message: 'Notificaciones antiguas eliminadas correctamente'
    });
  } catch (error) {
    console.error('Error limpiando notificaciones antiguas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadNotifications,
  countUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications
}; 