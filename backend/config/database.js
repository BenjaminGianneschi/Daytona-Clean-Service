// Cargar variables de entorno - usar local por defecto, postgres para producción
const envPath = process.env.NODE_ENV === 'production' ? './config.env.postgres' : './config.env.local';
require('dotenv').config({ path: envPath });

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