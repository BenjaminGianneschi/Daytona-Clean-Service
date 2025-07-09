// Configuración centralizada para la aplicación
window.AppConfig = {
  // URLs de la API según el entorno
  API_URLS: {
    production: 'https://daytona-clean-service.onrender.com/api', // URL real de Render
    development: 'http://localhost:3001/api', // <-- Cambiado a 3000
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

// Función para obtener la URL de la API (siempre nube)
window.getApiUrl = function() {
  return "https://daytona-clean-service.onrender.com/api";
};