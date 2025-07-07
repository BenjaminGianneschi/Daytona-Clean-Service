const { query } = require('../config/database');

async function addUserIdToAppointments() {
  try {
    console.log('🔧 Agregando campo user_id a la tabla appointments...');
    
    // Verificar si el campo ya existe
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'appointments' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ El campo user_id ya existe en la tabla appointments');
      return;
    }
    
    // Agregar el campo user_id
    await query(`
      ALTER TABLE appointments 
      ADD COLUMN user_id INT NULL,
      ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    
    console.log('✅ Campo user_id agregado exitosamente a la tabla appointments');
    
    // Crear índice para optimizar consultas
    await query(`
      CREATE INDEX idx_appointments_user ON appointments(user_id)
    `);
    
    console.log('✅ Índice creado para user_id');
    
  } catch (error) {
    console.error('❌ Error agregando campo user_id:', error);
    throw error;
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
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { addUserIdToAppointments }; 