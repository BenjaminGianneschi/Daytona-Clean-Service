const mysql = require('mysql2/promise');

// Configuración local para desarrollo
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Cambiar por tu contraseña de MySQL si la tienes
  database: 'daytona_turnos',
  port: 3306
};

async function addUserIdToAppointments() {
  let connection;
  
  try {
    console.log('🔧 Conectando a MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida');
    
    console.log('🔧 Verificando si el campo user_id ya existe...');
    
    // Verificar si el campo ya existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'daytona_turnos' 
      AND TABLE_NAME = 'appointments' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ El campo user_id ya existe en la tabla appointments');
      return;
    }
    
    console.log('🔧 Agregando campo user_id...');
    
    // Agregar el campo user_id
    await connection.execute(`
      ALTER TABLE appointments 
      ADD COLUMN user_id INT NULL
    `);
    
    console.log('✅ Campo user_id agregado exitosamente');
    
    // Agregar foreign key
    try {
      await connection.execute(`
        ALTER TABLE appointments 
        ADD CONSTRAINT fk_appointments_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key agregada exitosamente');
    } catch (fkError) {
      console.log('⚠️ No se pudo agregar foreign key (puede que la tabla users no exista):', fkError.message);
    }
    
    // Crear índice para optimizar consultas
    try {
      await connection.execute(`
        CREATE INDEX idx_appointments_user ON appointments(user_id)
      `);
      console.log('✅ Índice creado para user_id');
    } catch (indexError) {
      console.log('⚠️ No se pudo crear índice:', indexError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 SOLUCIÓN:');
      console.log('1. Verifica que MySQL esté instalado y ejecutándose');
      console.log('2. Verifica las credenciales en el archivo');
      console.log('3. Si tienes contraseña, agrega: password: "tu_contraseña"');
      console.log('4. Si usas XAMPP, la contraseña suele estar vacía');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addUserIdToAppointments()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error.message);
      process.exit(1);
    });
}

module.exports = { addUserIdToAppointments }; 