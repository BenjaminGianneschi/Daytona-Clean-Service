require('dotenv').config();
const { query } = require('../config/database');

async function testLoginRoute() {
  console.log('🧪 PROBANDO RUTA DE LOGIN');
  console.log('========================\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1. 🔗 Verificando conexión a la base de datos...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('   ✅ Conexión exitosa:', dbTest[0].current_time);
    console.log('');

    // 2. Verificar si existe la tabla users
    console.log('2. 📊 Verificando tabla users...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tables.length === 0) {
      console.log('   ❌ Tabla users no existe');
      return;
    }
    console.log('   ✅ Tabla users existe');
    console.log('');

    // 3. Verificar estructura de la tabla users
    console.log('3. 🔍 Verificando estructura de tabla users...');
    const columns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('   📋 Columnas encontradas:');
    columns.forEach(col => {
      console.log(`      - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // 4. Verificar si hay usuarios en la base de datos
    console.log('4. 👤 Verificando usuarios existentes...');
    const users = await query('SELECT id, name, email, role FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('   ⚠️ No hay usuarios en la base de datos');
      console.log('   💡 Necesitas registrar al menos un usuario primero');
    } else {
      console.log(`   ✅ Encontrados ${users.length} usuarios:`);
      users.forEach(user => {
        console.log(`      - ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Rol: ${user.role}`);
      });
    }
    console.log('');

    // 5. Probar consulta de login específica
    console.log('5. 🔐 Probando consulta de login...');
    const testEmail = 'test@example.com';
    
    try {
      const loginTest = await query('SELECT * FROM users WHERE email = ?', [testEmail]);
      console.log(`   ✅ Consulta de login funciona (${loginTest.length} resultados para ${testEmail})`);
    } catch (error) {
      console.log('   ❌ Error en consulta de login:', error.message);
    }
    console.log('');

    // 6. Verificar variables de entorno
    console.log('6. ⚙️ Verificando variables de entorno...');
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '24h (default)'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log('');

    // 7. Probar bcrypt (para verificar que funciona)
    console.log('7. 🔒 Probando bcrypt...');
    try {
      const bcrypt = require('bcryptjs');
      const testPassword = '123456';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const isValid = await bcrypt.compare(testPassword, hashedPassword);
      console.log(`   ✅ bcrypt funciona correctamente: ${isValid}`);
    } catch (error) {
      console.log('   ❌ Error con bcrypt:', error.message);
    }
    console.log('');

    console.log('🎉 DIAGNÓSTICO COMPLETADO');
    console.log('========================');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
testLoginRoute()
  .then(() => {
    console.log('✅ Script de diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  }); 