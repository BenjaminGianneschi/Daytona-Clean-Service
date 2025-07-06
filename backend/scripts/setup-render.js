const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Configurando base de datos en Render...');
  
  let pool;
  let client;
  
  try {
    // Verificar variables de entorno requeridas
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️ Variables de entorno faltantes:', missingVars.join(', '));
      console.log('ℹ️ Saltando configuración de base de datos...');
      return;
    }

    // Crear conexión a la base de datos PostgreSQL
    pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });

    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Verificar si las tablas ya existen
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'appointments', 'services')
    `);

    if (tables.length >= 3) {
      console.log('ℹ️ Las tablas ya existen, saltando creación de esquema');
    } else {
      // Leer el archivo de esquema SQL
      const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
      const schema = await fs.readFile(schemaPath, 'utf8');

      // Ejecutar el esquema en una transacción
      await client.query('BEGIN');
      
      try {
        await client.query(schema);
        await client.query('COMMIT');
        console.log('✅ Esquema de base de datos creado exitosamente');
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error ejecutando esquema:', error.message);
        
        // En producción, no fallar el build
        if (process.env.NODE_ENV === 'production') {
          console.log('⚠️ Continuando con el despliegue a pesar del error de esquema...');
          return;
        } else {
          throw error;
        }
      }
    }

    // Crear usuario administrador por defecto si no existe
    try {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const { rows: existingAdmin } = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@daytona.com.ar']
      );

      if (existingAdmin.length === 0) {
        await client.query(
          `INSERT INTO users (name, email, password, role, phone, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          ['Administrador', 'admin@daytona.com.ar', hashedPassword, 'admin', '3482588383']
        );
        console.log('✅ Usuario administrador creado');
        console.log('📧 Email: admin@daytona.com.ar');
        console.log('🔑 Contraseña: admin123');
      } else {
        console.log('ℹ️ Usuario administrador ya existe');
      }
    } catch (error) {
      console.log('⚠️ Error creando usuario administrador:', error.message);
    }

    console.log('✅ Configuración de base de datos completada');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    
    // En producción, no fallar el build por errores de DB
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Continuando con el despliegue a pesar del error de DB...');
      return;
    } else {
      process.exit(1);
    }
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
  setupDatabase();
}

module.exports = { setupDatabase }; 