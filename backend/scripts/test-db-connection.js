const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    console.log('🔧 Probando conexión a MySQL...');
    
    // Intentar diferentes configuraciones
    const configs = [
      {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'daytona_turnos',
        port: 3306
      },
      {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'daytona_turnos',
        port: 3306
      },
      {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'daytona_turnos',
        port: 3306
      }
    ];
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`\n🔍 Probando configuración ${i + 1}:`);
      console.log(`   Host: ${config.host}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      
      try {
        connection = await mysql.createConnection(config);
        console.log('✅ Conexión exitosa!');
        
        // Verificar si la tabla appointments existe
        const [tables] = await connection.execute(`
          SHOW TABLES LIKE 'appointments'
        `);
        
        if (tables.length > 0) {
          console.log('✅ Tabla appointments encontrada');
          
          // Verificar estructura de la tabla
          const [columns] = await connection.execute(`
            DESCRIBE appointments
          `);
          
          console.log('📋 Estructura de la tabla appointments:');
          columns.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
          
          // Verificar si user_id ya existe
          const hasUserId = columns.some(col => col.Field === 'user_id');
          
          if (hasUserId) {
            console.log('✅ Campo user_id ya existe');
          } else {
            console.log('🔧 Agregando campo user_id...');
            
            try {
              await connection.execute(`
                ALTER TABLE appointments 
                ADD COLUMN user_id INT NULL
              `);
              console.log('✅ Campo user_id agregado exitosamente');
              
              // Crear índice
              await connection.execute(`
                CREATE INDEX idx_appointments_user ON appointments(user_id)
              `);
              console.log('✅ Índice creado');
              
            } catch (alterError) {
              console.log('⚠️ Error agregando campo:', alterError.message);
            }
          }
          
        } else {
          console.log('❌ Tabla appointments no encontrada');
        }
        
        break; // Si llegamos aquí, la conexión fue exitosa
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (connection) {
          await connection.end();
          connection = null;
        }
      }
    }
    
    if (!connection) {
      console.log('\n💡 SOLUCIONES:');
      console.log('1. Verifica que MySQL esté instalado y ejecutándose');
      console.log('2. Si usas XAMPP:');
      console.log('   - Abre XAMPP Control Panel');
      console.log('   - Inicia MySQL');
      console.log('   - La contraseña suele estar vacía');
      console.log('3. Si usas WAMP:');
      console.log('   - Abre WAMP');
      console.log('   - Inicia MySQL');
      console.log('4. Verifica que la base de datos "daytona_turnos" exista');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n🎉 Prueba completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { testConnection }; 