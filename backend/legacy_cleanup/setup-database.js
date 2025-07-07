const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Configurando base de datos...');
    
    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Conexión a MySQL establecida');
    
    // Crear base de datos si no existe
    await connection.execute('CREATE DATABASE IF NOT EXISTS daytona_turnos');
    console.log('✅ Base de datos daytona_turnos creada/verificada');
    
    // Usar la base de datos
    await connection.execute('USE daytona_turnos');
    
    // Leer y ejecutar el archivo schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaContent = await fs.readFile(schemaPath, 'utf8');
    
    // Dividir el contenido en comandos individuales
    const commands = schemaContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await connection.execute(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Comando ${i + 1}/${commands.length} omitido (ya existe)`);
          } else {
            console.error(`❌ Error en comando ${i + 1}/${commands.length}:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Base de datos configurada exitosamente!');
    
    // Verificar tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tablas creadas:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 