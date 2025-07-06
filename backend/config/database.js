require('dotenv').config({ path: './config.env' });

// Determinar qué base de datos usar basado en las variables de entorno
const usePostgres = process.env.DB_TYPE === 'postgres' || process.env.DB_PORT === '5432';

let database;

if (usePostgres) {
  console.log('🐘 Usando PostgreSQL');
  database = require('./database-postgres');
} else {
  console.log('🐬 Usando MySQL');
  database = require('./database-mysql');
}

module.exports = database; 