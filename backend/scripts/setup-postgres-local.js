const { Pool } = require('pg');
require('dotenv').config({ path: '../config.env.local' });

async function setupLocalDatabase() {
  console.log('🔧 Configurando base de datos PostgreSQL local...');
  
  // Primero conectarse a la base de datos postgres por defecto
  const defaultPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres', // Base de datos por defecto
    port: process.env.DB_PORT || 5432
  });

  try {
    // Crear la base de datos si no existe
    console.log('📊 Creando base de datos...');
    await defaultPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'daytona_turnos'}`);
    console.log('✅ Base de datos creada exitosamente');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️ La base de datos ya existe');
    } else {
      console.error('❌ Error creando base de datos:', error.message);
      return;
    }
  } finally {
    await defaultPool.end();
  }

  // Ahora conectarse a la base de datos específica
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'daytona_turnos',
    port: process.env.DB_PORT || 5432
  });

  try {
    // Crear tabla users
    console.log('👥 Creando tabla users...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla appointments
    console.log('📅 Creando tabla appointments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        service_type VARCHAR(100) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        vehicle_info TEXT,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Base de datos configurada exitosamente');
    
    // Crear usuario admin por defecto
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await pool.query(`
        INSERT INTO users (username, email, password, role) 
        VALUES ('admin', 'admin@daytona.com', $1, 'admin')
        ON CONFLICT (username) DO NOTHING
      `, [hashedPassword]);
      console.log('👤 Usuario admin creado (username: admin, password: admin123)');
    } catch (error) {
      console.log('ℹ️ Usuario admin ya existe');
    }

  } catch (error) {
    console.error('❌ Error configurando tablas:', error.message);
  } finally {
    await pool.end();
  }
}

setupLocalDatabase(); 