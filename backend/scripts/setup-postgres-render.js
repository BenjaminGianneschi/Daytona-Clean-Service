const { Pool } = require('pg');

async function setupPostgresRender() {
  let pool;
  
  try {
    console.log('🔧 Configurando PostgreSQL con base de datos de Render...');
    
    // Configuración para PostgreSQL de Render
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'daytona_turnos',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
    
    console.log('📋 Configuración detectada:');
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
    
    pool = new Pool(config);
    
    // Probar conexión
    console.log('\n🔍 Probando conexión...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos de Render');
    client.release();
    
    // Verificar estructura de la base de datos
    console.log('\n📋 Verificando estructura de la base de datos...');
    
    // Verificar si la tabla users existe
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'appointments', 'services')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    if (tables.rows.length === 0) {
      console.log('   ❌ No se encontraron tablas principales');
      console.log('   💡 Ejecutando esquema...');
      
      // Ejecutar esquema si no hay tablas
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await pool.query(schema);
      console.log('✅ Esquema ejecutado correctamente');
    } else {
      tables.rows.forEach(table => {
        console.log(`   ✅ ${table.table_name}`);
      });
    }
    
    // Verificar usuarios existentes
    console.log('\n👥 Verificando usuarios existentes...');
    const users = await pool.query('SELECT id, name, email FROM users LIMIT 5');
    
    if (users.rows.length === 0) {
      console.log('   ❌ No hay usuarios en la base de datos');
      console.log('   💡 Creando usuario de prueba...');
      
      // Crear usuario de prueba
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
    } else {
      console.log('   ✅ Usuarios encontrados:');
      users.rows.forEach(user => {
        console.log(`      - ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}`);
      });
    }
    
    // Verificar turnos existentes
    console.log('\n📅 Verificando turnos existentes...');
    const appointments = await pool.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, u.name as user_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 5
    `);
    
    if (appointments.rows.length === 0) {
      console.log('   ❌ No hay turnos en la base de datos');
    } else {
      console.log('   ✅ Turnos encontrados:');
      appointments.rows.forEach(app => {
        console.log(`      - ID: ${app.id}, Fecha: ${app.appointment_date}, Usuario: ${app.user_name || 'Sin usuario'}`);
      });
    }
    
    console.log('\n🎉 Configuración completada exitosamente');
    console.log('\n📝 Para probar:');
    console.log('1. Configura las variables de entorno:');
    console.log('   DB_TYPE=postgres');
    console.log('   DB_HOST=tu-host-de-render');
    console.log('   DB_USER=tu-usuario');
    console.log('   DB_PASSWORD=tu-contraseña');
    console.log('   DB_NAME=tu-base-de-datos');
    console.log('   DB_PORT=5432');
    console.log('2. Ejecuta: npm restart');
    console.log('3. Prueba con: test@daytona.com / password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCIÓN:');
      console.log('1. Verifica que las variables de entorno estén configuradas');
      console.log('2. Verifica que la base de datos de Render esté activa');
      console.log('3. Verifica las credenciales de conexión');
    }
    
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupPostgresRender()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { setupPostgresRender }; 