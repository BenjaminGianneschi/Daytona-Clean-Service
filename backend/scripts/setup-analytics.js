const { query } = require('../config/database');

async function setupAnalytics() {
  console.log('🚀 Configurando tablas de analytics...');
  
  try {
    // Crear tabla de eventos de analytics
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        page_url VARCHAR(500) NOT NULL,
        page_title VARCHAR(255),
        referrer_url VARCHAR(500),
        user_agent TEXT,
        ip_address INET,
        country VARCHAR(50),
        city VARCHAR(100),
        device_type VARCHAR(50),
        browser VARCHAR(50),
        os VARCHAR(50),
        screen_resolution VARCHAR(20),
        language VARCHAR(10),
        duration INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de resumen diario
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_daily_summary (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_visitors INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        new_users INTEGER DEFAULT 0,
        appointments_created INTEGER DEFAULT 0,
        appointments_completed INTEGER DEFAULT 0,
        popular_pages JSONB,
        device_breakdown JSONB,
        traffic_sources JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de performance de páginas
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_page_performance (
        id SERIAL PRIMARY KEY,
        page_url VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        unique_views INTEGER DEFAULT 0,
        avg_duration DECIMAL(8,2) DEFAULT 0,
        bounce_rate DECIMAL(5,2) DEFAULT 0,
        exit_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(page_url, date)
      )
    `);

    // Crear tabla de embudo de conversión
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_funnel (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        total_visitors INTEGER DEFAULT 0,
        converted_visitors INTEGER DEFAULT 0,
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, step_name)
      )
    `);

    // Crear índices para optimización
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_events_page_url ON analytics_events(page_url)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_summary(date)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_page_performance_date ON analytics_page_performance(date)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_funnel_date ON analytics_funnel(date)'
    ];

    for (const index of indices) {
      await query(index);
    }

    // Crear trigger para actualizar updated_at en analytics_daily_summary
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await query(`
      CREATE TRIGGER update_analytics_daily_updated_at 
      BEFORE UPDATE ON analytics_daily_summary
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Tablas de analytics configuradas correctamente');
    
    // Insertar algunos datos de prueba
    console.log('📊 Insertando datos de prueba...');
    
    const sampleEvents = [
      {
        session_id: 'test_session_1',
        event_type: 'page_view',
        page_url: 'https://daytona-clean-service.onrender.com/index.html',
        page_title: 'Inicio - Daytona Clean Service',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows'
      },
      {
        session_id: 'test_session_1',
        event_type: 'service_view',
        page_url: 'https://daytona-clean-service.onrender.com/vehiculos.html',
        page_title: 'Servicios de Vehículos - Daytona Clean Service',
        device_type: 'desktop',
        browser: 'Chrome',
        os: 'Windows'
      },
      {
        session_id: 'test_session_2',
        event_type: 'page_view',
        page_url: 'https://daytona-clean-service.onrender.com/index.html',
        page_title: 'Inicio - Daytona Clean Service',
        device_type: 'mobile',
        browser: 'Safari',
        os: 'iOS'
      }
    ];

    for (const event of sampleEvents) {
      await query(`
        INSERT INTO analytics_events 
        (session_id, event_type, page_url, page_title, device_type, browser, os, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '1 day')
      `, [
        event.session_id,
        event.event_type,
        event.page_url,
        event.page_title,
        event.device_type,
        event.browser,
        event.os
      ]);
    }

    console.log('✅ Datos de prueba insertados');
    console.log('🎉 Setup de analytics completado exitosamente');

  } catch (error) {
    console.error('❌ Error configurando analytics:', error);
    throw error;
  }
}

// Ejecutar setup si es llamado directamente
if (require.main === module) {
  setupAnalytics()
    .then(() => {
      console.log('✅ Setup completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en setup:', error);
      process.exit(1);
    });
}

module.exports = { setupAnalytics };