// Script de debugging específico para las cards de servicios
class CardsDebugger {
  constructor() {
    this.debugInfo = {
      domReady: false,
      managerCreated: false,
      servicesLoaded: false,
      cardsRendered: false,
      errors: []
    };
  }

  // Iniciar debugging
  start() {
    console.log('🔍 Iniciando debugging de cards...');
    this.checkDOMReady();
    this.checkManagerCreation();
    this.checkServicesLoading();
    this.checkCardsRendering();
    this.showResults();
  }

  // Verificar si el DOM está listo
  checkDOMReady() {
    const track = document.getElementById('servicesTrack');
    const filterButtons = document.querySelectorAll('.service-filter-btn');
    const modal = document.getElementById('serviceModal');
    
    this.debugInfo.domReady = !!(track && filterButtons.length > 0 && modal);
    
    console.log('🏗️ DOM Ready:', this.debugInfo.domReady);
    console.log('  - servicesTrack:', !!track);
    console.log('  - filterButtons:', filterButtons.length);
    console.log('  - modal:', !!modal);
    
    if (!this.debugInfo.domReady) {
      this.debugInfo.errors.push('Elementos del DOM no encontrados');
    }
  }

  // Verificar creación del manager
  checkManagerCreation() {
    setTimeout(() => {
      if (window.indexManager) {
        this.debugInfo.managerCreated = true;
        console.log('✅ IndexServiceManager creado');
        console.log('  - isInitialized:', window.indexManager.isInitialized);
        console.log('  - allServices:', window.indexManager.allServices?.length || 0);
      } else {
        console.log('❌ IndexServiceManager no creado');
        this.debugInfo.errors.push('IndexServiceManager no se creó');
      }
    }, 1000);
  }

  // Verificar carga de servicios
  checkServicesLoading() {
    setTimeout(() => {
      if (window.indexManager && window.indexManager.allServices) {
        this.debugInfo.servicesLoaded = window.indexManager.allServices.length > 0;
        console.log('📦 Servicios cargados:', this.debugInfo.servicesLoaded);
        console.log('  - Cantidad:', window.indexManager.allServices.length);
        console.log('  - Vehiculares:', window.indexManager.vehicularServices?.length || 0);
        console.log('  - Tapizados:', window.indexManager.tapizadosServices?.length || 0);
        
        if (!this.debugInfo.servicesLoaded) {
          this.debugInfo.errors.push('No se cargaron servicios');
        }
      } else {
        console.log('❌ No se pudieron cargar servicios');
        this.debugInfo.errors.push('Error en carga de servicios');
      }
    }, 2000);
  }

  // Verificar renderizado de cards
  checkCardsRendering() {
    setTimeout(() => {
      const track = document.getElementById('servicesTrack');
      if (track) {
        const cards = track.querySelectorAll('.carousel-item');
        this.debugInfo.cardsRendered = cards.length > 0;
        
        console.log('🎴 Cards renderizadas:', this.debugInfo.cardsRendered);
        console.log('  - Cantidad:', cards.length);
        console.log('  - Contenido del track:', track.innerHTML.substring(0, 100) + '...');
        
        if (!this.debugInfo.cardsRendered) {
          this.debugInfo.errors.push('No se renderizaron cards');
        }
      } else {
        console.log('❌ Track no encontrado para verificar cards');
        this.debugInfo.errors.push('Track no encontrado');
      }
    }, 3000);
  }

  // Mostrar resultados
  showResults() {
    setTimeout(() => {
      console.log('\n📊 RESULTADOS DEL DEBUGGING:');
      console.log('=============================');
      console.log('🏗️ DOM Ready:', this.debugInfo.domReady ? '✅' : '❌');
      console.log('🔧 Manager Created:', this.debugInfo.managerCreated ? '✅' : '❌');
      console.log('📦 Services Loaded:', this.debugInfo.servicesLoaded ? '✅' : '❌');
      console.log('🎴 Cards Rendered:', this.debugInfo.cardsRendered ? '✅' : '❌');
      
      if (this.debugInfo.errors.length > 0) {
        console.log('\n❌ ERRORES ENCONTRADOS:');
        this.debugInfo.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      } else {
        console.log('\n✅ Todo parece estar funcionando correctamente');
      }
      
      // Sugerir soluciones
      this.suggestSolutions();
    }, 4000);
  }

  // Sugerir soluciones
  suggestSolutions() {
    console.log('\n💡 SUGERENCIAS:');
    
    if (!this.debugInfo.domReady) {
      console.log('  - Verificar que el HTML se cargue correctamente');
      console.log('  - Revisar que los IDs de los elementos sean correctos');
    }
    
    if (!this.debugInfo.managerCreated) {
      console.log('  - Verificar que el script de IndexServiceManager se ejecute');
      console.log('  - Revisar errores de JavaScript en la consola');
    }
    
    if (!this.debugInfo.servicesLoaded) {
      console.log('  - Verificar conexión con la API');
      console.log('  - Ejecutar: reloadServices()');
      console.log('  - Ejecutar: showFallbackServices()');
    }
    
    if (!this.debugInfo.cardsRendered) {
      console.log('  - Verificar que los servicios se procesen correctamente');
      console.log('  - Revisar la función createServiceCard');
    }
  }

  // Función para forzar recarga
  forceReload() {
    console.log('🔄 Forzando recarga completa...');
    
    if (window.indexManager) {
      window.indexManager.loadFallbackServices();
      console.log('✅ Servicios de respaldo cargados');
    } else {
      console.log('❌ No se puede recargar - manager no disponible');
    }
  }

  // Función para verificar API
  checkAPI() {
    console.log('🌐 Verificando API...');
    const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
    
    fetch(`${apiUrl}/appointments/services`)
      .then(response => {
        console.log('📡 Respuesta de API:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📦 Datos de API:', data);
        if (data.success && data.services) {
          console.log('✅ API funcionando correctamente');
          console.log('  - Servicios disponibles:', data.services.length);
        } else {
          console.log('❌ API no devolvió datos válidos');
        }
      })
      .catch(error => {
        console.error('❌ Error de API:', error);
      });
  }
}

// Crear instancia global
window.cardsDebugger = new CardsDebugger();

// Función global para iniciar debugging
window.debugCardsSystem = function() {
  window.cardsDebugger.start();
};

// Función global para verificar API
window.checkAPIConnection = function() {
  window.cardsDebugger.checkAPI();
};

// Función global para forzar recarga
window.forceReloadCards = function() {
  window.cardsDebugger.forceReload();
};

// Iniciar debugging automáticamente después de 5 segundos
setTimeout(() => {
  console.log('🔧 Debugging automático de cards iniciado...');
  window.debugCardsSystem();
}, 5000);

// Agregar comandos útiles a la consola
console.log('🔧 Comandos de debugging de cards disponibles:');
console.log('  - debugCardsSystem() - Iniciar debugging completo');
console.log('  - checkAPIConnection() - Verificar conexión con API');
console.log('  - forceReloadCards() - Forzar recarga de servicios'); 