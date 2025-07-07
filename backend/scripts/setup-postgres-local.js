const { Pool } = require('pg');

async function setupPostgresLocal() {
  let pool;
  
  try {
    console.log('🔧 Configurando PostgreSQL local...');
    
    // Configuración para PostgreSQL local
    const config = {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres', // Cambiar según tu configuración
      database: 'postgres', // Base de datos por defecto
      port: 5432,
      ssl: false
    };
    
    pool = new Pool(config);
    
    // Probar conexión
    console.log('🔍 Probando conexión...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa');
    client.release();
    
    // Crear base de datos si no existe
    console.log('\n📋 Creando base de datos...');
    try {
      await pool.query('CREATE DATABASE daytona_turnos');
      console.log('✅ Base de datos daytona_turnos creada');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('✅ Base de datos daytona_turnos ya existe');
      } else {
        throw error;
      }
    }
    
    // Conectar a la base de datos daytona_turnos
    await pool.end();
    
    const dbConfig = {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      database: 'daytona_turnos',
      port: 5432,
      ssl: false
    };
    
    pool = new Pool(dbConfig);
    
    // Ejecutar esquema
    console.log('\n📋 Ejecutando esquema...');
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Esquema ejecutado correctamente');
    
    // Crear usuario de prueba
    console.log('\n👤 Creando usuario de prueba...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, phone) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        phone = EXCLUDED.phone
    `, ['Usuario Prueba', 'test@daytona.com', hashedPassword, '3482123456']);
    
    console.log('✅ Usuario de prueba creado');
    
    // Verificar que todo funciona
    console.log('\n🔍 Verificando configuración...');
    const users = await pool.query('SELECT id, name, email FROM users WHERE email = $1', ['test@daytona.com']);
    
    if (users.rows.length > 0) {
      console.log('✅ Usuario encontrado:', users.rows[0]);
    }
    
    console.log('\n🎉 Configuración de PostgreSQL completada');
    console.log('\n📝 Credenciales de prueba:');
    console.log('   Email: test@daytona.com');
    console.log('   Contraseña: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCIÓN:');
      console.log('1. Instala PostgreSQL: https://www.postgresql.org/download/');
      console.log('2. Inicia el servicio PostgreSQL');
      console.log('3. Verifica que el puerto 5432 esté disponible');
      console.log('4. Verifica las credenciales en el script');
    }
    
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupPostgresLocal()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { setupPostgresLocal }; 