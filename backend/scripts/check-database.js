const { query } = require('../config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    // Verificar qué tablas existen
    console.log('\n1. Verificando tablas existentes...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Si no existe la tabla appointments, crearla
    if (!tables.find(t => t.table_name === 'appointments')) {
      console.log('\n2. La tabla appointments no existe. Creándola...');
      
      await query(`
        CREATE TABLE appointments (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL,
          user_id INTEGER,
          appointment_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME,
          total_amount DECIMAL(10,2),
          notes TEXT,
          service_location TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla appointments creada');
    }
    
    // Si no existe la tabla clients, crearla
    if (!tables.find(t => t.table_name === 'clients')) {
      console.log('\n3. La tabla clients no existe. Creándola...');
      
      await query(`
        CREATE TABLE clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla clients creada');
    }
    
    // Si no existe la tabla services, crearla
    if (!tables.find(t => t.table_name === 'services')) {
      console.log('\n4. La tabla services no existe. Creándola...');
      
      await query(`
        CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          duration INTEGER DEFAULT 120,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla services creada');
    }
    
    // Si no existe la tabla appointment_services, crearla
    if (!tables.find(t => t.table_name === 'appointment_services')) {
      console.log('\n5. La tabla appointment_services no existe. Creándola...');
      
      await query(`
        CREATE TABLE appointment_services (
          id SERIAL PRIMARY KEY,
          appointment_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          duration INTEGER DEFAULT 120,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabla appointment_services creada');
    }
    
    // Verificar tabla users
    console.log('\n6. Verificando tabla users...');
    const usersStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('Columnas de users:');
    usersStructure.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar usuarios existentes
    const users = await query('SELECT id, name, email FROM users LIMIT 5');
    console.log(`Usuarios encontrados: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`   Usuario ${i + 1}:`, user);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDatabase().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { checkDatabase }; 