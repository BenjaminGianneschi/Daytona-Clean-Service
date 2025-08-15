const { query } = require('../config/database');

const analyticsModel = {
  // Registrar un evento de analytics
  async recordEvent(eventData) {
    try {
      const {
        sessionId,
        userId = null,
        eventType,
        pageUrl,
        pageTitle = null,
        referrerUrl = null,
        userAgent = null,
        ipAddress = null,
        country = null,
        city = null,
        deviceType = null,
        browser = null,
        os = null,
        screenResolution = null,
        language = null,
        duration = null,
        metadata = null
      } = eventData;

      // Sanitizar IP si llega con valores no válidos
      const ipValue = (typeof ipAddress === 'string' && ipAddress.includes(',')) 
        ? ipAddress.split(',')[0].trim() 
        : ipAddress;

      const result = await query(
        `INSERT INTO analytics_events 
         (session_id, user_id, event_type, page_url, page_title, referrer_url, 
          user_agent, ip_address, country, city, device_type, browser, os, 
          screen_resolution, language, duration, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
         RETURNING id`,
        [sessionId, userId, eventType, pageUrl, pageTitle, referrerUrl, 
         userAgent, ipValue, country, city, deviceType, browser, os, 
         screenResolution, language, duration, metadata]
      );

      return result[0];
    } catch (error) {
      console.error('Error registrando evento:', error);
      throw error;
    }
  },

  // Obtener estadísticas del dashboard
  async getDashboardStats(period = '30') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Estadísticas generales
      const [generalStats] = await query(`
        SELECT 
          COUNT(DISTINCT session_id) as total_visitors,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_page_views,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          AVG(duration) as avg_session_duration
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view'
      `, [startDate]);

      // Páginas más visitadas
      const popularPages = await query(`
        SELECT 
          page_url,
          page_title,
          COUNT(*) as views,
          COUNT(DISTINCT session_id) as unique_visitors,
          AVG(duration) as avg_duration
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view'
        GROUP BY page_url, page_title
        ORDER BY views DESC
        LIMIT 10
      `, [startDate]);

      // Dispositivos más usados
      const deviceStats = await query(`
        SELECT 
          device_type,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view' AND device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY count DESC
      `, [startDate]);

      // Navegadores más usados
      const browserStats = await query(`
        SELECT 
          browser,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view' AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 8
      `, [startDate]);

      // Tráfico por día
      const dailyTraffic = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT session_id) as visitors,
          COUNT(*) as page_views
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [startDate]);

      // Eventos de conversión
      const conversionStats = await query(`
        SELECT 
          event_type,
          COUNT(*) as count
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type IN ('appointment_create', 'register', 'login', 'service_view')
        GROUP BY event_type
      `, [startDate]);

      return {
        general: generalStats,
        popular_pages: popularPages,
        devices: deviceStats,
        browsers: browserStats,
        daily_traffic: dailyTraffic,
        conversions: conversionStats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Obtener estadísticas de tiempo real (últimas 24 horas)
  async getRealTimeStats() {
    try {
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      const [realtimeStats] = await query(`
        SELECT 
          COUNT(DISTINCT session_id) as visitors_24h,
          COUNT(*) as page_views_24h,
          COUNT(DISTINCT CASE WHEN event_type = 'appointment_create' THEN session_id END) as appointments_24h
        FROM analytics_events 
        WHERE created_at >= $1
      `, [last24h]);

      // Visitantes activos (últimos 30 minutos)
      const last30min = new Date();
      last30min.setMinutes(last30min.getMinutes() - 30);

      const [activeStats] = await query(`
        SELECT 
          COUNT(DISTINCT session_id) as active_visitors
        FROM analytics_events 
        WHERE created_at >= $1
      `, [last30min]);

      // Páginas más vistas en tiempo real
      const realtimePages = await query(`
        SELECT 
          page_url,
          page_title,
          COUNT(*) as views
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = 'page_view'
        GROUP BY page_url, page_title
        ORDER BY views DESC
        LIMIT 5
      `, [last24h]);

      return {
        ...realtimeStats,
        ...activeStats,
        realtime_pages: realtimePages
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas en tiempo real:', error);
      throw error;
    }
  },

  // Obtener eventos por período para gráficos
  async getEventsByPeriod(eventType = 'page_view', period = '7', groupBy = 'day') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      let groupByClause;
      let dateFormat;
      
      switch(groupBy) {
        case 'hour':
          groupByClause = "DATE_TRUNC('hour', created_at)";
          dateFormat = 'YYYY-MM-DD HH24:00';
          break;
        case 'day':
          groupByClause = "DATE(created_at)";
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          groupByClause = "DATE_TRUNC('week', created_at)";
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'month':
          groupByClause = "DATE_TRUNC('month', created_at)";
          dateFormat = 'YYYY-MM';
          break;
        default:
          groupByClause = "DATE(created_at)";
          dateFormat = 'YYYY-MM-DD';
      }

      const result = await query(`
        SELECT 
          ${groupByClause} as period,
          TO_CHAR(${groupByClause}, '${dateFormat}') as formatted_date,
          COUNT(*) as count,
          COUNT(DISTINCT session_id) as unique_sessions
        FROM analytics_events 
        WHERE created_at >= $1 AND event_type = $2
        GROUP BY ${groupByClause}
        ORDER BY period DESC
      `, [startDate, eventType]);

      return result;
    } catch (error) {
      console.error('Error obteniendo eventos por período:', error);
      throw error;
    }
  },

  // Actualizar resumen diario (para job automático)
  async updateDailySummary(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];

      const summary = await query(`
        SELECT 
          COUNT(DISTINCT session_id) as total_visitors,
          COUNT(DISTINCT user_id) as unique_visitors,
          COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
          COUNT(CASE WHEN event_type = 'register' THEN 1 END) as new_users,
          COUNT(CASE WHEN event_type = 'appointment_create' THEN 1 END) as appointments_created
        FROM analytics_events 
        WHERE DATE(created_at) = $1
      `, [targetDate]);

      // Popular pages para el día
      const popularPages = await query(`
        SELECT 
          page_url,
          COUNT(*) as views
        FROM analytics_events 
        WHERE DATE(created_at) = $1 AND event_type = 'page_view'
        GROUP BY page_url
        ORDER BY views DESC
        LIMIT 10
      `, [targetDate]);

      // Device breakdown
      const deviceBreakdown = await query(`
        SELECT 
          device_type,
          COUNT(*) as count
        FROM analytics_events 
        WHERE DATE(created_at) = $1 AND device_type IS NOT NULL
        GROUP BY device_type
      `, [targetDate]);

      const summaryData = summary[0];
      
      await query(`
        INSERT INTO analytics_daily_summary 
        (date, total_visitors, unique_visitors, page_views, new_users, 
         appointments_created, popular_pages, device_breakdown)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (date) DO UPDATE SET
          total_visitors = EXCLUDED.total_visitors,
          unique_visitors = EXCLUDED.unique_visitors,
          page_views = EXCLUDED.page_views,
          new_users = EXCLUDED.new_users,
          appointments_created = EXCLUDED.appointments_created,
          popular_pages = EXCLUDED.popular_pages,
          device_breakdown = EXCLUDED.device_breakdown,
          updated_at = CURRENT_TIMESTAMP
      `, [
        targetDate,
        summaryData.total_visitors || 0,
        summaryData.unique_visitors || 0,
        summaryData.page_views || 0,
        summaryData.new_users || 0,
        summaryData.appointments_created || 0,
        JSON.stringify(popularPages),
        JSON.stringify(deviceBreakdown)
      ]);

      return summaryData;
    } catch (error) {
      console.error('Error actualizando resumen diario:', error);
      throw error;
    }
  },

  // Obtener datos para exportar
  async getExportData(startDate, endDate, eventTypes = ['page_view']) {
    try {
      const result = await query(`
        SELECT 
          created_at,
          session_id,
          user_id,
          event_type,
          page_url,
          page_title,
          device_type,
          browser,
          os,
          country,
          city,
          duration
        FROM analytics_events 
        WHERE created_at BETWEEN $1 AND $2 
        AND event_type = ANY($3)
        ORDER BY created_at DESC
      `, [startDate, endDate, eventTypes]);

      return result;
    } catch (error) {
      console.error('Error obteniendo datos de exportación:', error);
      throw error;
    }
  }
};

module.exports = analyticsModel;