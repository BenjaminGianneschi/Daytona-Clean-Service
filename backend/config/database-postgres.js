const { Pool } = require('pg');
// Cargar variables de entorno - usar local por defecto, postgres para producción
const envPath = process.env.NODE_ENV === 'production' ? './config.env.postgres' : './config.env.local';
require('dotenv').config({ path: envPath });

// Configuración de la conexión a PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daytona_turnos',
  port: process.env.DB_PORT || 5432,
  max: 10, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
}

// Función para obtener una conexión
async function getConnection() {
  try {
    return await pool.connect();
  } catch (error) {
    console.error('Error obteniendo conexión:', error);
    throw error;
  }
}

// Función para iniciar una transacción
async function beginTransaction() {
  const client = await getConnection();
  await client.query('BEGIN');
  return client;
}

// Función para hacer commit de una transacción
async function commitTransaction(client) {
  await client.query('COMMIT');
  client.release();
}

// Función para hacer rollback de una transacción
async function rollbackTransaction(client) {
  await client.query('ROLLBACK');
  client.release();
}

// Función para cerrar el pool
async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  getConnection,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  testConnection,
  closePool
}; 