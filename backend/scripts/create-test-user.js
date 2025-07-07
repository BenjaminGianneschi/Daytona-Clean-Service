const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
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
    console.log('\n📋 Verificando estructura de la tabla users...');
    const [columns] = await connection.execute('DESCRIBE users');
    
    // Encontrar el campo de contraseña
    const passwordField = columns.find(col => 
      col.Field === 'password' || 
      col.Field === 'password_hash' || 
      col.Field === 'passwordHash'
    );
    
    if (!passwordField) {
      console.log('❌ No se encontró campo de contraseña');
      console.log('Campos disponibles:', columns.map(col => col.Field).join(', '));
      return;
    }
    
    console.log(`✅ Campo de contraseña: ${passwordField.Field}`);
    
    // Crear contraseña hash
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('\n👤 Creando usuario de prueba...');
    
    // Crear usuario de prueba
    const [result] = await connection.execute(`
      INSERT INTO users (name, email, phone, ${passwordField.Field}) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        phone = VALUES(phone),
        ${passwordField.Field} = VALUES(${passwordField.Field})
    `, ['Usuario Prueba', 'test@daytona.com', '3482123456', hashedPassword]);
    
    console.log('✅ Usuario de prueba creado/actualizado');
    
    // Verificar que se creó correctamente
    const [users] = await connection.execute(`
      SELECT id, name, email, phone FROM users WHERE email = ?
    `, ['test@daytona.com']);
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`\n✅ Usuario creado exitosamente:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Teléfono: ${user.phone}`);
      console.log(`   Contraseña: ${password}`);
      
      console.log('\n📝 Credenciales para probar:');
      console.log(`   Email: test@daytona.com`);
      console.log(`   Contraseña: ${password}`);
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
  createTestUser()
    .then(() => {
      console.log('\n🎉 Usuario de prueba creado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { createTestUser }; 