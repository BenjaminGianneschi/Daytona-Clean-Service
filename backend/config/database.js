// Cargar variables de entorno - usar local por defecto, postgres para producción
const envPath = process.env.NODE_ENV === 'production' ? './config.env.postgres' : './config.env.local';
require('dotenv').config({ path: envPath });

// Usar solo PostgreSQL
console.log('🐘 Usando PostgreSQL');
const database = require('./database-postgres');

module.exports = database; 