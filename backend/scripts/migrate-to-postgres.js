const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function migrateToPostgres() {
  console.log('🔄 Iniciando migración a PostgreSQL...');
  
  let pool;
  let client;
  
  try {
    // Verificar variables de entorno
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️ Variables de entorno faltantes:', missingVars.join(', '));
      console.log('ℹ️ No se puede realizar la migración');
      return false;
    }

    // Crear conexión a PostgreSQL
    pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Leer y ejecutar el esquema
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Ejecutar el esquema en transacción
    await client.query('BEGIN');
    
    try {
      await client.query(schema);
      await client.query('COMMIT');
      console.log('✅ Esquema de PostgreSQL aplicado exitosamente');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    return true;

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateToPostgres().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}

module.exports = { migrateToPostgres }; 