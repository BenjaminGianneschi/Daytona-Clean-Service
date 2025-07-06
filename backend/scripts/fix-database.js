const { query } = require('../config/database');

async function fixDatabase() {
  console.log('🔧 Verificando y corrigiendo la base de datos...');
  
  try {
    // 1. Verificar si la tabla users existe
    console.log('1. Verificando tabla users...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Tabla users no existe. Creando...');
      await createUsersTable();
    } else {
      console.log('✅ Tabla users existe');
    }
    
    // 2. Verificar columnas de la tabla users
    console.log('2. Verificando columnas de la tabla users...');
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    
    console.log('Columnas encontradas:', columns.map(c => c.column_name));
    
    // 3. Verificar si existe la columna password
    const hasPassword = columns.some(c => c.column_name === 'password');
    const hasPasswordHash = columns.some(c => c.column_name === 'password_hash');
    
    if (!hasPassword && !hasPasswordHash) {
      console.log('❌ No existe columna password. Agregando...');
      await query('ALTER TABLE users ADD COLUMN password VARCHAR(255)');
      console.log('✅ Columna password agregada');
    } else if (hasPasswordHash && !hasPassword) {
      console.log('⚠️ Existe password_hash pero no password. Renombrando...');
      await query('ALTER TABLE users RENAME COLUMN password_hash TO password');
      console.log('✅ Columna renombrada de password_hash a password');
    } else {
      console.log('✅ Columna password existe correctamente');
    }
    
    // 4. Verificar si existe la columna phone
    const hasPhone = columns.some(c => c.column_name === 'phone');
    if (!hasPhone) {
      console.log('❌ No existe columna phone. Agregando...');
      await query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
      console.log('✅ Columna phone agregada');
    } else {
      console.log('✅ Columna phone existe');
    }
    
    // 5. Verificar si existe la columna created_at
    const hasCreatedAt = columns.some(c => c.column_name === 'created_at');
    if (!hasCreatedAt) {
      console.log('❌ No existe columna created_at. Agregando...');
      await query('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ Columna created_at agregada');
    } else {
      console.log('✅ Columna created_at existe');
    }
    
    // 6. Verificar si existe la columna updated_at
    const hasUpdatedAt = columns.some(c => c.column_name === 'updated_at');
    if (!hasUpdatedAt) {
      console.log('❌ No existe columna updated_at. Agregando...');
      await query('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ Columna updated_at agregada');
    } else {
      console.log('✅ Columna updated_at existe');
    }
    
    // 7. Verificar si existe la columna role
    const hasRole = columns.some(c => c.column_name === 'role');
    if (!hasRole) {
      console.log('❌ No existe columna role. Agregando...');
      await query('ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT \'user\'');
      console.log('✅ Columna role agregada');
    } else {
      console.log('✅ Columna role existe');
    }
    
    console.log('🎉 Verificación de base de datos completada');
    
    // 8. Mostrar estructura final
    const finalColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura final de la tabla users:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    throw error;
  }
}

async function createUsersTable() {
  await query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabla users creada');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixDatabase()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabase }; 