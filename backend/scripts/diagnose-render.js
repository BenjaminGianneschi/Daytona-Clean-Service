require('dotenv').config();
const { query } = require('../config/database');

async function diagnoseRender() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE RENDER');
  console.log('=====================================\n');

  try {
    // 1. Verificar variables de entorno
    console.log('1. 📋 VARIABLES DE ENTORNO:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - PORT: ${process.env.PORT || '3000'}`);
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - WHATSAPP_TOKEN: ${process.env.WHATSAPP_TOKEN ? '✅ Configurada' : '❌ No configurada'}`);
    console.log('');

    // 2. Probar conexión a la base de datos
    console.log('2. 🗄️ CONEXIÓN A BASE DE DATOS:');
    try {
      const result = await query('SELECT NOW() as current_time, version() as db_version');
      console.log('   ✅ Conexión exitosa');
      console.log(`   - Hora actual: ${result[0].current_time}`);
      console.log(`   - Versión DB: ${result[0].db_version.split(' ')[0]}`);
    } catch (error) {
      console.log('   ❌ Error de conexión:', error.message);
      return;
    }
    console.log('');

    // 3. Verificar tablas
    console.log('3. 📊 TABLAS EN LA BASE DE DATOS:');
    try {
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (tables.length === 0) {
        console.log('   ⚠️ No hay tablas en la base de datos');
      } else {
        console.log(`   ✅ Encontradas ${tables.length} tablas:`);
        tables.forEach(table => {
          console.log(`      - ${table.table_name}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error verificando tablas:', error.message);
    }
    console.log('');

    // 4. Verificar estructura de tabla users
    console.log('4. 👥 ESTRUCTURA DE TABLA USERS:');
    try {
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      if (columns.length === 0) {
        console.log('   ❌ Tabla users no existe');
      } else {
        console.log(`   ✅ Tabla users tiene ${columns.length} columnas:`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = col.column_default ? `DEFAULT ${col.column_default}` : '';
          console.log(`      - ${col.column_name}: ${col.data_type} ${nullable} ${defaultValue}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error verificando tabla users:', error.message);
    }
    console.log('');

    // 5. Verificar usuarios existentes
    console.log('5. 👤 USUARIOS EXISTENTES:');
    try {
      const users = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
      
      if (users.length === 0) {
        console.log('   ℹ️ No hay usuarios registrados');
      } else {
        console.log(`   ✅ Encontrados ${users.length} usuarios:`);
        users.forEach(user => {
          console.log(`      - ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Rol: ${user.role}, Creado: ${user.created_at}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error consultando usuarios:', error.message);
    }
    console.log('');

    // 6. Verificar tabla appointments
    console.log('6. 📅 ESTRUCTURA DE TABLA APPOINTMENTS:');
    try {
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'appointments' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      if (columns.length === 0) {
        console.log('   ℹ️ Tabla appointments no existe (normal si no se ha usado)');
      } else {
        console.log(`   ✅ Tabla appointments tiene ${columns.length} columnas:`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultValue = col.column_default ? `DEFAULT ${col.column_default}` : '';
          console.log(`      - ${col.column_name}: ${col.data_type} ${nullable} ${defaultValue}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error verificando tabla appointments:', error.message);
    }
    console.log('');

    console.log('🎉 DIAGNÓSTICO COMPLETADO');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnoseRender()
  .then(() => {
    console.log('✅ Script de diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  }); 