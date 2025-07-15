const express = require('express');
const router = express.Router();
const { authenticateUserToken } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Verificar notificaciones nuevas (para polling)
router.get('/check', authenticateUserToken, async (req, res) => {
  try {
    // Por ahora retornamos un array vacío
    // En el futuro se implementará con base de datos
    res.json({ 
      success: true, 
      notifications: [] 
    });
  } catch (error) {
    console.error('Error verificando notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Marcar notificación como leída
router.put('/:id/read', authenticateUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Por ahora solo simulamos
    console.log(`Notificación ${id} marcada como leída`);
    
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Probar sistema de notificaciones
router.post('/test', authenticateUserToken, async (req, res) => {
  try {
    const { phone } = req.body;
    
    const result = await notificationService.testNotifications(phone);
    
    res.json(result);
  } catch (error) {
    console.error('Error probando notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router; 