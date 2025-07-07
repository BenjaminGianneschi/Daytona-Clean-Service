const mysql = require('mysql2/promise');

async function checkUsersTable() {
  let connection;
  
  try {
    console.log('🔧 Conectando a MySQL...');
    
    const config = {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'daytona_turnos',
      port: 3306
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida');
    
    // Verificar estructura de la tabla users
    console.log('\n📋 Estructura de la tabla users:');
    const [columns] = await connection.execute('DESCRIBE users');
    
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar usuarios existentes
    console.log('\n👥 Usuarios existentes:');
    const [users] = await connection.execute('SELECT id, name, email, phone FROM users LIMIT 10');
    
    if (users.length === 0) {
      console.log('   ❌ No hay usuarios en la tabla');
    } else {
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Teléfono: ${user.phone}`);
      });
    }
    
    // Verificar si hay campo de contraseña
    const hasPassword = columns.some(col => 
      col.Field === 'password' || 
      col.Field === 'password_hash' || 
      col.Field === 'passwordHash'
    );
    
    if (!hasPassword) {
      console.log('\n⚠️ ADVERTENCIA: No se encontró campo de contraseña');
      console.log('   Campos disponibles:', columns.map(col => col.Field).join(', '));
    } else {
      const passwordField = columns.find(col => 
        col.Field === 'password' || 
        col.Field === 'password_hash' || 
        col.Field === 'passwordHash'
      );
      console.log(`\n✅ Campo de contraseña encontrado: ${passwordField.Field}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkUsersTable()
    .then(() => {
      console.log('\n🎉 Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { checkUsersTable }; 