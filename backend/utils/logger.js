const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
  }

  /**
   * Escribir log al archivo
   */
  writeToFile(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (data) {
      logEntry += ` | Data: ${JSON.stringify(data)}`;
    }
    
    logEntry += '\n';
    
    fs.appendFileSync(this.logFile, logEntry);
  }

  /**
   * Log de información
   */
  info(message, data = null) {
    console.log(`[INFO] ${message}`, data || '');
    this.writeToFile('info', message, data);
  }

  /**
   * Log de error
   */
  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    console.error(`[ERROR] ${message}`, error || '');
    this.writeToFile('error', message, errorData);
  }

  /**
   * Log de advertencia
   */
  warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data || '');
    this.writeToFile('warn', message, data);
  }

  /**
   * Log de debug
   */
  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
      this.writeToFile('debug', message, data);
    }
  }

  /**
   * Log de éxito
   */
  success(message, data = null) {
    console.log(`[SUCCESS] ${message}`, data || '');
    this.writeToFile('success', message, data);
  }
}

module.exports = new Logger(); 