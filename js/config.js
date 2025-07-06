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
  const hostname = window.location.hostname;
  
  // Si estamos en producción (daytona.com.ar)
  if (hostname === 'daytona.com.ar' || hostname === 'www.daytona.com.ar') {
    return AppConfig.API_URLS.production;
  }
  
  // Si estamos en localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return AppConfig.API_URLS.development;
  }
  
  // Si estamos en Render, usar la URL actual
  if (hostname.includes('onrender.com')) {
    return `${window.location.origin}/api`;
  }
  
  // Por defecto, usar producción
  return AppConfig.API_URLS.production;
}; 