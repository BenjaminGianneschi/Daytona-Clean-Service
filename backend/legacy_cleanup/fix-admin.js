const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function fixAdmin() {
  try {
    console.log('🔧 Arreglando administrador...');
    
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('✅ Hash generado:', passwordHash.substring(0, 20) + '...');
    
    // Actualizar o crear administrador
    await query(
      'INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
      ['admin', 'admin@daytona.com.ar', passwordHash, 'Administrador Principal', 'super_admin', passwordHash]
    );
    
    console.log('✅ Administrador arreglado exitosamente');
    console.log('');
    console.log('📋 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('');
    console.log('🌐 Accede a: http://localhost:3000/admin/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }
}

fixAdmin(); 