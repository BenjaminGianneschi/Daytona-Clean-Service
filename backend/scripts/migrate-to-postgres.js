const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function migrateToPostgres() {
  console.log('🔄 Iniciando migración de MySQL a PostgreSQL...');
  
  try {
    // Conexión a MySQL (origen)
    const mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DB || 'daytona_turnos',
      port: process.env.MYSQL_PORT || 3306
    });

    // Conexión a PostgreSQL (destino)
    const pgPool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('✅ Conexiones establecidas');

    // Crear esquema en PostgreSQL
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    const pgClient = await pgPool.connect();
    await pgClient.query(schema);
    console.log('✅ Esquema creado en PostgreSQL');

    // Migrar usuarios
    const [users] = await mysqlConnection.execute('SELECT * FROM users');
    for (const user of users) {
      await pgClient.query(
        `INSERT INTO users (id, name, email, password, role, phone, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.name, user.email, user.password, user.role, user.phone, user.created_at, user.updated_at]
      );
    }
    console.log(`✅ ${users.length} usuarios migrados`);

    // Migrar servicios
    const [services] = await mysqlConnection.execute('SELECT * FROM services');
    for (const service of services) {
      await pgClient.query(
        `INSERT INTO services (id, name, description, price, duration, is_active, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [service.id, service.name, service.description, service.price, service.duration, service.is_active, service.created_at]
      );
    }
    console.log(`✅ ${services.length} servicios migrados`);

    // Migrar turnos
    const [appointments] = await mysqlConnection.execute('SELECT * FROM appointments');
    for (const appointment of appointments) {
      await pgClient.query(
        `INSERT INTO appointments (id, user_id, service_type, vehicle_type, vehicle_brand, vehicle_model, vehicle_year, appointment_date, appointment_time, duration, status, notes, total_price, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          appointment.id, appointment.user_id, appointment.service_type, appointment.vehicle_type,
          appointment.vehicle_brand, appointment.vehicle_model, appointment.vehicle_year,
          appointment.appointment_date, appointment.appointment_time, appointment.duration,
          appointment.status, appointment.notes, appointment.total_price,
          appointment.created_at, appointment.updated_at
        ]
      );
    }
    console.log(`✅ ${appointments.length} turnos migrados`);

    // Migrar configuración
    const [settings] = await mysqlConnection.execute('SELECT * FROM settings');
    for (const setting of settings) {
      await pgClient.query(
        `INSERT INTO settings (id, key, value, description, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO NOTHING`,
        [setting.id, setting.key, setting.value, setting.description, setting.created_at, setting.updated_at]
      );
    }
    console.log(`✅ ${settings.length} configuraciones migradas`);

    // Migrar logs
    const [logs] = await mysqlConnection.execute('SELECT * FROM logs');
    for (const log of logs) {
      await pgClient.query(
        `INSERT INTO logs (id, level, message, user_id, ip_address, user_agent, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [log.id, log.level, log.message, log.user_id, log.ip_address, log.user_agent, log.created_at]
      );
    }
    console.log(`✅ ${logs.length} logs migrados`);

    // Cerrar conexiones
    await mysqlConnection.end();
    pgClient.release();
    await pgPool.end();

    console.log('🎉 Migración completada exitosamente');
    console.log('📝 Recuerda actualizar las variables de entorno para usar PostgreSQL');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateToPostgres();
}

module.exports = { migrateToPostgres }; 