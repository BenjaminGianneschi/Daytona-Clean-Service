const { Pool } = require('pg');

async function testPostgresConnection() {
  let pool;
  
  try {
    console.log('🔧 Probando conexión a PostgreSQL...');
    
    // Configuraciones a probar
    const configs = [
      {
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        database: 'daytona_turnos',
        port: 5432,
        ssl: false
      },
      {
        host: 'localhost',
        user: 'postgres',
        password: '',
        database: 'daytona_turnos',
        port: 5432,
        ssl: false
      },
      {
        host: 'localhost',
        user: 'postgres',
        password: 'password',
        database: 'daytona_turnos',
        port: 5432,
        ssl: false
      }
    ];
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`\n🔍 Probando configuración ${i + 1}:`);
      console.log(`   Host: ${config.host}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      
      try {
        pool = new Pool(config);
        const client = await pool.connect();
        console.log('✅ Conexión exitosa!');
        
        // Verificar si la tabla users existe
        const tables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        `);
        
        if (tables.rows.length > 0) {
          console.log('✅ Tabla users encontrada');
          
          // Verificar estructura de la tabla
          const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
          `);
          
          console.log('📋 Estructura de la tabla users:');
          columns.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
          
          // Verificar usuarios existentes
          const users = await client.query('SELECT id, name, email FROM users LIMIT 5');
          console.log('\n👥 Usuarios existentes:');
          
          if (users.rows.length === 0) {
            console.log('   ❌ No hay usuarios en la tabla');
          } else {
            users.rows.forEach(user => {
              console.log(`   - ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}`);
            });
          }
          
        } else {
          console.log('❌ Tabla users no encontrada');
        }
        
        client.release();
        break; // Si llegamos aquí, la conexión fue exitosa
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (pool) {
          await pool.end();
          pool = null;
        }
      }
    }
    
    if (!pool) {
      console.log('\n💡 SOLUCIONES:');
      console.log('1. Instala PostgreSQL: https://www.postgresql.org/download/');
      console.log('2. Inicia el servicio PostgreSQL');
      console.log('3. Verifica que el puerto 5432 esté disponible');
      console.log('4. Verifica las credenciales en el script');
      console.log('5. Si usas Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPostgresConnection()
    .then(() => {
      console.log('\n🎉 Prueba completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { testPostgresConnection }; 