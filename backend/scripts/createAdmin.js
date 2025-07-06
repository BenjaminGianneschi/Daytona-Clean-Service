const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function createAdmin() {
  try {
    console.log('🔧 Creando administrador por defecto...');
    
    // Generar hash de la contraseña admin123
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash generado correctamente');
    
    // Verificar si ya existe un administrador
    const existingAdmin = await query(
      'SELECT id FROM admins WHERE username = ?',
      ['admin']
    );
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  El administrador ya existe, actualizando contraseña...');
      
      // Actualizar contraseña
      await query(
        'UPDATE admins SET password_hash = ? WHERE username = ?',
        [passwordHash, 'admin']
      );
      
      console.log('✅ Contraseña actualizada correctamente');
    } else {
      console.log('➕ Creando nuevo administrador...');
      
      // Crear nuevo administrador
      await query(
        'INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@daytona.com.ar', passwordHash, 'Administrador Principal', 'super_admin']
      );
      
      console.log('✅ Administrador creado correctamente');
    }
    
    console.log('🎉 Proceso completado exitosamente');
    console.log('📋 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  }
}

// Ejecutar el script
createAdmin(); 