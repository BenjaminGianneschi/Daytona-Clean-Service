const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Configurando base de datos en Render...');
  
  try {
    // Crear conexión a la base de datos PostgreSQL
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Leer el archivo de esquema SQL
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Ejecutar el esquema
    await client.query(schema);
    console.log('✅ Esquema de base de datos creado exitosamente');

    // Crear usuario administrador por defecto si no existe
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

    client.release();
    await pool.end();
    console.log('✅ Configuración de base de datos completada');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 