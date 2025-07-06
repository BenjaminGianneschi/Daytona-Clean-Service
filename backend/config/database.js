const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daytona_turnos',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
}

// Función para obtener una conexión
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error);
    throw error;
  }
}

// Función para iniciar una transacción
async function beginTransaction() {
  const connection = await getConnection();
  await connection.beginTransaction();
  return connection;
}

// Función para hacer commit de una transacción
async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

// Función para hacer rollback de una transacción
async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

module.exports = {
  pool,
  query,
  getConnection,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  testConnection
}; 