#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function manualSetup() {
  console.log('🔧 Configuración Manual de Base de Datos - Daytona Clean Service');
  console.log('===============================================================\n');

  try {
    // Verificar si estamos en producción
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Detectado entorno de producción');
      console.log('ℹ️ Usando variables de entorno de Render...\n');
    }

    // Verificar variables de entorno
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
      console.log('\nPor favor, configura las siguientes variables de entorno:');
      missingVars.forEach(varName => {
        console.log(`- ${varName}`);
      });
      console.log('\nEn Render, ve a tu proyecto > Environment > Environment Variables');
      return;
    }

    console.log('✅ Variables de entorno configuradas correctamente');

    // Crear conexión a PostgreSQL
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

    // Verificar si las tablas ya existen
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'appointments', 'services')
    `);

    if (tables.length >= 3) {
      console.log('ℹ️ Las tablas ya existen en la base de datos');
      
      const answer = await question('¿Deseas recrear las tablas? (y/N): ');
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('ℹ️ Saltando recreación de tablas');
      } else {
        console.log('🗑️ Eliminando tablas existentes...');
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('✅ Tablas eliminadas');
      }
    }

    // Leer y ejecutar el esquema
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    console.log('📝 Aplicando esquema de base de datos...');
    
    await client.query('BEGIN');
    try {
      await client.query(schema);
      await client.query('COMMIT');
      console.log('✅ Esquema aplicado exitosamente');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error aplicando esquema:', error.message);
      throw error;
    }

    // Crear usuario administrador
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

    // Verificar servicios
    const { rows: services } = await client.query('SELECT COUNT(*) as count FROM services');
    console.log(`✅ ${services[0].count} servicios configurados`);

    // Verificar configuración
    const { rows: settings } = await client.query('SELECT COUNT(*) as count FROM settings');
    console.log(`✅ ${settings[0].count} configuraciones aplicadas`);

    client.release();
    await pool.end();

    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- Base de datos PostgreSQL configurada');
    console.log('- Tablas creadas');
    console.log('- Usuario administrador disponible');
    console.log('- Servicios y configuración aplicados');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🌐 Tu aplicación está lista en:');
      console.log(`https://${process.env.RENDER_SERVICE_NAME || 'tu-app'}.onrender.com`);
    }

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verifica que las variables de entorno estén configuradas');
    console.log('2. Asegúrate de que la base de datos PostgreSQL esté disponible');
    console.log('3. Revisa los logs para más detalles');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  manualSetup();
}

module.exports = { manualSetup }; 