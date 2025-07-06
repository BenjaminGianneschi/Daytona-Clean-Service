// Configuración centralizada para la aplicación
window.AppConfig = {
  // URLs de la API según el entorno
  API_URLS: {
    production: 'https://daytona-clean-service.onrender.com/api', // URL real de Render
    development: 'http://localhost:3000/api',
    render: null // Se detectará automáticamente
  },
  
  // Configuración de WhatsApp
  WHATSAPP: {
    phone: '5493482588383',
    message: 'Hola! Me gustaría solicitar información sobre los servicios de limpieza.'
  },
  
  // Configuración de la aplicación
  APP: {
    name: 'Daytona Clean Service',
    version: '1.0.0',
    adminEmail: 'admin@daytona.com.ar'
  }
};

// Función para obtener la URL de la API según el entorno
window.getApiUrl = function() {
  // Forzar el uso de la API de Render para evitar problemas de CORS
  return 'https://daytona-clean-service.onrender.com/api';
}; 