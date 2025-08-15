const analyticsModel = require('../models/analyticsModel');

const analyticsController = {
  // Obtener estadísticas del dashboard
  async getDashboardStats(req, res) {
    try {
      const { period = '30' } = req.query;
      
      if (!['7', '30', '90', '365'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Período inválido. Use: 7, 30, 90, o 365 días'
        });
      }

      const stats = await analyticsModel.getDashboardStats(period);
      
      res.json({
        success: true,
        data: stats,
        period: `${period} días`
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas en tiempo real
  async getRealTimeStats(req, res) {
    try {
      const stats = await analyticsModel.getRealTimeStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas en tiempo real:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener datos para gráficos
  async getChartData(req, res) {
    try {
      const { 
        type = 'page_view', 
        period = '7', 
        groupBy = 'day' 
      } = req.query;

      if (!['hour', 'day', 'week', 'month'].includes(groupBy)) {
        return res.status(400).json({
          success: false,
          message: 'Agrupación inválida. Use: hour, day, week, o month'
        });
      }

      const chartData = await analyticsModel.getEventsByPeriod(type, period, groupBy);
      
      // Formatear datos para Chart.js
      const labels = chartData.map(item => item.formatted_date);
      const data = chartData.map(item => item.count);
      const uniqueData = chartData.map(item => item.unique_sessions);

      res.json({
        success: true,
        data: {
          labels: labels.reverse(), // Mostrar del más antiguo al más reciente
          datasets: [
            {
              label: 'Eventos Totales',
              data: data.reverse(),
              borderColor: '#ff3b3f',
              backgroundColor: 'rgba(255, 59, 63, 0.1)',
              tension: 0.4
            },
            {
              label: 'Sesiones Únicas',
              data: uniqueData.reverse(),
              borderColor: '#00d4aa',
              backgroundColor: 'rgba(0, 212, 170, 0.1)',
              tension: 0.4
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error obteniendo datos de gráfico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Registrar evento personalizado desde frontend
  async recordEvent(req, res) {
    try {
      const {
        eventType,
        pageUrl,
        pageTitle,
        metadata = {}
      } = req.body;

      if (!eventType || !pageUrl) {
        return res.status(400).json({
          success: false,
          message: 'eventType y pageUrl son requeridos'
        });
      }

      // Usar el helper del middleware si está disponible
      if (req.trackEvent) {
        await req.trackEvent(eventType, { pageTitle, ...metadata });
      } else {
        // Fallback: registrar directamente
        const sessionId = req.cookies.analytics_session_id || 
                         Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        const eventData = {
          sessionId,
          userId: req.user ? req.user.id : null,
          eventType,
          pageUrl,
          pageTitle,
          metadata,
          userAgent: req.headers['user-agent'],
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        await analyticsModel.recordEvent(eventData);
      }

      res.json({
        success: true,
        message: 'Evento registrado correctamente'
      });
    } catch (error) {
      console.error('Error registrando evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener datos para exportar
  async exportData(req, res) {
    try {
      const {
        startDate,
        endDate,
        format = 'json',
        eventTypes = 'page_view'
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate y endDate son requeridos'
        });
      }

      const types = eventTypes.split(',');
      const data = await analyticsModel.getExportData(startDate, endDate, types);

      if (format === 'csv') {
        // Convertir a CSV
        const headers = [
          'Fecha',
          'Session ID',
          'Usuario ID',
          'Tipo de Evento',
          'URL',
          'Título',
          'Dispositivo',
          'Navegador',
          'SO',
          'País',
          'Ciudad',
          'Duración (s)'
        ];

        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
          const csvRow = [
            row.created_at,
            row.session_id,
            row.user_id || '',
            row.event_type,
            `"${row.page_url}"`,
            `"${row.page_title || ''}"`,
            row.device_type || '',
            row.browser || '',
            row.os || '',
            row.country || '',
            row.city || '',
            row.duration || ''
          ];
          csv += csvRow.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${startDate}_${endDate}.csv`);
        res.send(csv);
      } else {
        // Formato JSON
        res.json({
          success: true,
          data,
          total: data.length,
          period: {
            start: startDate,
            end: endDate
          }
        });
      }
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar resumen diario (endpoint para job manual)
  async updateDailySummary(req, res) {
    try {
      const { date } = req.body;
      
      const summary = await analyticsModel.updateDailySummary(date);
      
      res.json({
        success: true,
        data: summary,
        message: 'Resumen diario actualizado correctamente'
      });
    } catch (error) {
      console.error('Error actualizando resumen diario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener métricas de rendimiento de páginas
  async getPagePerformance(req, res) {
    try {
      const { period = '7' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const { query } = require('../config/database');
      
      const performanceData = await query(`
        SELECT 
          page_url,
          COUNT(*) as total_views,
          COUNT(DISTINCT session_id) as unique_visitors,
          AVG(duration) as avg_duration,
          MAX(created_at) as last_view
        FROM analytics_events 
        WHERE created_at >= $1 
        AND event_type = 'page_view'
        AND page_url IS NOT NULL
        GROUP BY page_url
        ORDER BY total_views DESC
        LIMIT 20
      `, [startDate]);

      res.json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error('Error obteniendo rendimiento de páginas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas de conversión
  async getConversionStats(req, res) {
    try {
      const { period = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const { query } = require('../config/database');
      
      // Embudo de conversión básico
      const funnelData = await query(`
        WITH funnel_stats AS (
          SELECT 
            COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) as visitors,
            COUNT(DISTINCT CASE WHEN event_type = 'service_view' THEN session_id END) as service_viewers,
            COUNT(DISTINCT CASE WHEN event_type = 'register' THEN session_id END) as registrations,
            COUNT(DISTINCT CASE WHEN event_type = 'appointment_create' THEN session_id END) as appointments
          FROM analytics_events 
          WHERE created_at >= $1
        )
        SELECT 
          visitors,
          service_viewers,
          registrations,
          appointments,
          CASE WHEN visitors > 0 THEN ROUND(service_viewers::decimal / visitors * 100, 2) ELSE 0 END as service_view_rate,
          CASE WHEN service_viewers > 0 THEN ROUND(registrations::decimal / service_viewers * 100, 2) ELSE 0 END as registration_rate,
          CASE WHEN registrations > 0 THEN ROUND(appointments::decimal / registrations * 100, 2) ELSE 0 END as appointment_rate,
          CASE WHEN visitors > 0 THEN ROUND(appointments::decimal / visitors * 100, 2) ELSE 0 END as overall_conversion_rate
        FROM funnel_stats
      `, [startDate]);

      res.json({
        success: true,
        data: funnelData[0] || {},
        period: `${period} días`
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de conversión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = analyticsController;