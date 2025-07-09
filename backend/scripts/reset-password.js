const bcrypt = require('bcrypt');
const { query } = require('../config/database');

async function resetPassword() {
  try {
    console.log('🔧 Reseteando contraseña...');
    
    // Configura aquí tu email y nueva contraseña
    const userEmail = 'benjamingianneschi5@gmail.com'; // Cambia por tu email
    const newPassword = 'admin123'; // Cambia por la contraseña que quieras
    
    // Verificar si existe el usuario
    const existingUser = await query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [userEmail]
    );
    
    if (existingUser.length === 0) {
      console.log('❌ No se encontró ningún usuario con ese email');
      console.log(`📧 Email buscado: ${userEmail}`);
      return;
    }
    
    const user = existingUser[0];
    
    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar la contraseña
    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, userEmail]
    );
    
    console.log('✅ Contraseña reseteada exitosamente!');
    console.log(`👤 Usuario: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    console.log('');
    console.log('🚀 Ahora puedes iniciar sesión con:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Contraseña: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error reseteando contraseña:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
resetPassword(); 