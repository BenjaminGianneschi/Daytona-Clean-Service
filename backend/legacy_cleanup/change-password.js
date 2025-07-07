const bcrypt = require('bcryptjs');
const { query } = require('./config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function changePassword() {
  try {
    console.log('🔐 Cambio de Contraseña - Panel de Administración');
    console.log('================================================');
    console.log('');
    
    // Solicitar nueva contraseña
    const newPassword = await new Promise((resolve) => {
      rl.question('Ingresa la nueva contraseña: ', (answer) => {
        resolve(answer);
      });
    });
    
    const confirmPassword = await new Promise((resolve) => {
      rl.question('Confirma la nueva contraseña: ', (answer) => {
        resolve(answer);
      });
    });
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      console.log('❌ Las contraseñas no coinciden');
      rl.close();
      return;
    }
    
    // Validar longitud mínima
    if (newPassword.length < 8) {
      console.log('❌ La contraseña debe tener al menos 8 caracteres');
      rl.close();
      return;
    }
    
    console.log('');
    console.log('🔧 Generando hash de la nueva contraseña...');
    
    // Generar hash de la nueva contraseña
    const saltRounds = 12; // Más seguro
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar contraseña en la base de datos
    await query(
      'UPDATE admins SET password_hash = ? WHERE username = ?',
      [passwordHash, 'admin']
    );
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📋 Nuevas credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: [la que acabas de ingresar]');
    console.log('');
    console.log('🌐 Accede a: http://localhost:3000/admin/');
    console.log('');
    console.log('🔒 Recomendaciones de seguridad:');
    console.log('   - Usa una contraseña única');
    console.log('   - Combina letras, números y símbolos');
    console.log('   - No la compartas con nadie');
    console.log('   - Cámbiala regularmente');
    
  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error.message);
  } finally {
    rl.close();
  }
}

changePassword(); 