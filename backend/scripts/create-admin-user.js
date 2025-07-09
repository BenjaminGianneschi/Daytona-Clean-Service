const bcrypt = require('bcrypt');
const { query } = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    // Datos del admin
    const adminData = {
      name: 'Benjamin Gianneschi',
      email: 'benjamingianneschi5@gmail.com',
      password: 'admin123', // Contraseña temporal
      phone: '3482625005',
      role: 'admin'
    };
    
    // Verificar si ya existe un usuario con ese email
    const existingUser = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminData.email]
    );
    
    if (existingUser.length > 0) {
      console.log('⚠️  Ya existe un usuario con ese email. Actualizando rol a admin...');
      
      await query(
        'UPDATE users SET role = $1 WHERE email = $2',
        [adminData.role, adminData.email]
      );
      
      console.log('✅ Usuario actualizado como administrador');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔑 Contraseña: ${adminData.password}`);
      console.log(`👤 Rol: ${adminData.role}`);
      
      return;
    }
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Crear el usuario admin
    const result = await query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [adminData.name, adminData.email, hashedPassword, adminData.phone, adminData.role]
    );
    
    const newUser = result[0];
    
    console.log('✅ Usuario administrador creado exitosamente!');
    console.log(`🆔 ID: ${newUser.id}`);
    console.log(`👤 Nombre: ${newUser.name}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`🔑 Contraseña: ${adminData.password}`);
    console.log(`👑 Rol: ${newUser.role}`);
    console.log('');
    console.log('🚀 Ahora puedes iniciar sesión en mi-cuenta.html con:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Contraseña: ${adminData.password}`);
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
createAdminUser(); 