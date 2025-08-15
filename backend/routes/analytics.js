const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAdmin } = require('../middleware/auth');

// Todas las rutas de analytics requieren permisos de admin
router.use(requireAdmin);

// Obtener estadísticas del dashboard
router.get('/dashboard', analyticsController.getDashboardStats);

// Obtener estadísticas en tiempo real
router.get('/realtime', analyticsController.getRealTimeStats);

// Obtener datos para gráficos
router.get('/charts', analyticsController.getChartData);

// Obtener rendimiento de páginas
router.get('/pages', analyticsController.getPagePerformance);

// Obtener estadísticas de conversión
router.get('/conversions', analyticsController.getConversionStats);

// Exportar datos
router.get('/export', analyticsController.exportData);

// Actualizar resumen diario (para jobs manuales)
router.post('/daily-summary', analyticsController.updateDailySummary);

// Endpoint público para registrar eventos desde frontend
router.post('/event', analyticsController.recordEvent);

module.exports = router;