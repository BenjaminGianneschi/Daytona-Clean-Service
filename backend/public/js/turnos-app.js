// Sistema de Turnos Simplificado - Daytona Clean Service
class TurnosApp {
  constructor() {
    this.currentStep = 1;
    this.selectedServices = [];
    this.appointmentData = {
      services: [],
      date: null,
      time: null,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      serviceLocation: '',
      totalAmount: 0
    };
    this.services = [];
    this.init();
  }

  async init() {
    console.log('🚀 Iniciando sistema de turnos...');
    await this.loadServices();
    this.setupEventListeners();
    this.showStep(1);
  }

  async loadServices() {
    try {
      const response = await fetch('/api/appointments/services');
      const data = await response.json();
      
      if (data.success) {
        this.services = data.services;
        console.log('✅ Servicios cargados:', this.services.length);
        this.renderServices();
      } else {
        console.error('❌ Error cargando servicios:', data.message);
      }
    } catch (error) {
      console.error('❌ Error en loadServices:', error);
    }
  }

  renderServices() {
    const vehiculosContainer = document.getElementById('lista-servicios-vehiculos');
    const tapizadosContainer = document.getElementById('lista-servicios-tapizados');
    
    if (vehiculosContainer) {
      vehiculosContainer.innerHTML = '';
      this.services
        .filter(s => s.category === 'vehiculos')
        .forEach(service => this.createServiceElement(service, vehiculosContainer));
    }
    
    if (tapizadosContainer) {
      tapizadosContainer.innerHTML = '';
      this.services
        .filter(s => s.category === 'tapizados')
        .forEach(service => this.createServiceElement(service, tapizadosContainer));
    }
  }

  createServiceElement(service, container) {
    const element = document.createElement('div');
    element.className = 'servicio-item';
    element.dataset.serviceId = service.id;
    element.dataset.name = service.name;
    element.dataset.price = service.price;
    element.dataset.duration = service.duration;
    
    element.innerHTML = `
      <div class="servicio-info">
        <div class="servicio-icon">
          <i class="fas ${this.getServiceIcon(service.name)}"></i>
        </div>
        <div class="servicio-details">
          <h6>${service.name}</h6>
          <p>${service.description || 'Servicio de limpieza profesional'}</p>
        </div>
      </div>
      <div class="servicio-precio">
        $${service.price.toLocaleString()}
      </div>
    `;
    
    element.addEventListener('click', () => this.toggleService(service, element));
    container.appendChild(element);
  }

  getServiceIcon(serviceName) {
    const name = serviceName.toLowerCase();
    if (name.includes('auto') || name.includes('car')) return 'fa-car';
    if (name.includes('pickup')) return 'fa-truck-pickup';
    if (name.includes('suv')) return 'fa-car-side';
    if (name.includes('motor')) return 'fa-cog';
    if (name.includes('sillón')) return 'fa-couch';
    if (name.includes('silla')) return 'fa-chair';
    if (name.includes('colchón')) return 'fa-bed';
    if (name.includes('alfombra')) return 'fa-rug';
    if (name.includes('puff')) return 'fa-couch';
    return 'fa-cog';
  }

  toggleService(service, element) {
    const existingIndex = this.selectedServices.findIndex(s => s.service_id === service.id);
    
    if (existingIndex >= 0) {
      // Deseleccionar
      this.selectedServices.splice(existingIndex, 1);
      element.classList.remove('selected');
    } else {
      // Seleccionar
      this.selectedServices.push({
        service_id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        quantity: 1
      });
      element.classList.add('selected');
    }
    
    this.updateSelectedServicesDisplay();
    this.updateNextButton();
  }

  updateSelectedServicesDisplay() {
    const container = document.getElementById('servicios-seleccionados');
    const listContainer = document.getElementById('lista-servicios');
    
    if (!container || !listContainer) return;
    
    if (this.selectedServices.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    listContainer.innerHTML = '';
    
    let total = 0;
    this.selectedServices.forEach(service => {
      const item = document.createElement('div');
      item.className = 'd-flex justify-content-between align-items-center mb-2 p-2 bg-dark rounded';
      item.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas ${this.getServiceIcon(service.name)} me-2"></i>
          <span>${service.name} x${service.quantity}</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="me-3">$${service.price.toLocaleString()}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="turnosApp.removeService(${service.service_id})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      listContainer.appendChild(item);
      total += service.price * service.quantity;
    });
    
    // Actualizar total
    const totalElement = document.getElementById('total-general');
    if (totalElement) {
      totalElement.textContent = `$${total.toLocaleString()}`;
    }
    
    this.appointmentData.totalAmount = total;
  }

  removeService(serviceId) {
    this.selectedServices = this.selectedServices.filter(s => s.service_id !== serviceId);
    this.updateSelectedServicesDisplay();
    this.updateNextButton();
    
    // Actualizar UI
    const element = document.querySelector(`[data-service-id="${serviceId}"]`);
    if (element) {
      element.classList.remove('selected');
    }
  }

  updateNextButton() {
    const btnSiguiente = document.getElementById('btn-siguiente');
    if (btnSiguiente) {
      btnSiguiente.style.display = this.selectedServices.length > 0 ? 'block' : 'none';
    }
  }

  setupEventListeners() {
    // Botón siguiente
    const btnSiguiente = document.getElementById('btn-siguiente');
    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', () => this.nextStep());
    }
    
    // Botón anterior
    const btnAnterior = document.getElementById('btn-anterior');
    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => this.previousStep());
    }
    
    // Categorías
    const categoriaVehiculos = document.getElementById('categoria-vehiculos');
    const categoriaTapizados = document.getElementById('categoria-tapizados');
    
    if (categoriaVehiculos) {
      categoriaVehiculos.addEventListener('click', () => this.selectCategory('vehiculos'));
    }
    
    if (categoriaTapizados) {
      categoriaTapizados.addEventListener('click', () => this.selectCategory('tapizados'));
    }
  }

  selectCategory(category) {
    console.log('📂 Seleccionando categoría:', category);
    
    // Ocultar categorías
    document.getElementById('categoria-vehiculos').style.display = 'none';
    document.getElementById('categoria-tapizados').style.display = 'none';
    
    // Mostrar servicios de la categoría
    const serviciosContainer = document.getElementById(`servicios-${category}`);
    if (serviciosContainer) {
      serviciosContainer.style.display = 'block';
    }
    
    // Mostrar botón siguiente
    this.updateNextButton();
  }

  changeCategory() {
    console.log('🔄 Cambiando categoría...');
    
    // Limpiar selecciones
    this.selectedServices = [];
    this.updateSelectedServicesDisplay();
    
    // Ocultar contenedores de servicios
    document.getElementById('servicios-vehiculos').style.display = 'none';
    document.getElementById('servicios-tapizados').style.display = 'none';
    
    // Mostrar categorías
    document.getElementById('categoria-vehiculos').style.display = 'block';
    document.getElementById('categoria-tapizados').style.display = 'block';
    
    // Ocultar botón siguiente
    const btnSiguiente = document.getElementById('btn-siguiente');
    if (btnSiguiente) {
      btnSiguiente.style.display = 'none';
    }
  }

  nextStep() {
    console.log('➡️ Siguiente paso:', this.currentStep);
    
    if (this.currentStep === 1) {
      if (this.selectedServices.length === 0) {
        alert('Por favor, selecciona al menos un servicio.');
        return;
      }
      this.appointmentData.services = this.selectedServices;
      this.currentStep = 2;
      
    } else if (this.currentStep === 2) {
      const fecha = document.getElementById('fecha')?.value;
      const hora = document.getElementById('hora')?.value;
      
      if (!fecha || !hora) {
        alert('Por favor, selecciona fecha y hora.');
        return;
      }
      
      this.appointmentData.date = fecha;
      this.appointmentData.time = hora;
      this.currentStep = 3;
      
    } else if (this.currentStep === 3) {
      const nombre = document.getElementById('nombre')?.value;
      const apellido = document.getElementById('apellido')?.value;
      const telefono = document.getElementById('telefono')?.value;
      
      if (!nombre || !apellido || !telefono) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
      }
      
      this.appointmentData.clientName = `${nombre} ${apellido}`.trim();
      this.appointmentData.clientPhone = telefono;
      this.appointmentData.clientEmail = document.getElementById('email')?.value || '';
      this.currentStep = 4;
      
    } else if (this.currentStep === 4) {
      const direccion = document.getElementById('direccion')?.value;
      
      if (!direccion) {
        alert('Por favor, ingresa la dirección del servicio.');
        return;
      }
      
      this.appointmentData.serviceLocation = direccion;
      this.currentStep = 5;
      this.showResumen();
      
    } else if (this.currentStep === 5) {
      this.confirmAppointment();
      return;
    }
    
    this.showStep(this.currentStep);
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  showStep(step) {
    console.log('📋 Mostrando paso:', step);
    
    // Ocultar todos los pasos
    for (let i = 1; i <= 5; i++) {
      const stepDiv = document.getElementById(`step-${i}`);
      if (stepDiv) {
        stepDiv.style.display = 'none';
      }
    }
    
    // Mostrar paso actual
    const currentStepDiv = document.getElementById(`step-${step}`);
    if (currentStepDiv) {
      currentStepDiv.style.display = 'block';
    }
    
    // Actualizar barra de progreso
    this.updateProgressBar(step);
    
    // Actualizar botones
    this.updateButtons(step);
    
    // Lógica específica por paso
    if (step === 3) {
      this.autoFillUserData();
    }
  }

  updateProgressBar(step) {
    const percent = ((step - 1) / 4) * 100;
    const barFill = document.getElementById('wizard-bar-fill');
    if (barFill) {
      barFill.style.width = percent + '%';
    }
    
    // Actualizar indicadores
    for (let i = 1; i <= 5; i++) {
      const indicator = document.getElementById(`step-indicator-${i}`);
      if (indicator) {
        indicator.classList.remove('active', 'completed');
        if (i < step) {
          indicator.classList.add('completed');
        } else if (i === step) {
          indicator.classList.add('active');
        }
      }
    }
  }

  updateButtons(step) {
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    
    if (btnAnterior) {
      btnAnterior.style.display = step > 1 ? 'block' : 'none';
    }
    
    if (btnSiguiente) {
      btnSiguiente.style.display = step < 5 ? 'block' : 'none';
      if (step === 5) {
        btnSiguiente.textContent = 'Confirmar Turno';
      } else {
        btnSiguiente.textContent = 'Siguiente';
      }
    }
  }

  autoFillUserData() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        
        // Separar nombre completo
        const nombres = user.name ? user.name.split(' ') : [];
        const nombre = nombres[0] || '';
        const apellido = nombres.slice(1).join(' ') || '';
        
        // Buscar teléfono
        const telefono = user.phone || user.telefono || user.phonenumber || user.celular || user.phoneNumber || '';
        
        // Auto-completar campos
        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        const telefonoInput = document.getElementById('telefono');
        const emailInput = document.getElementById('email');
        
        if (nombreInput) nombreInput.value = nombre;
        if (apellidoInput) apellidoInput.value = apellido;
        if (telefonoInput) telefonoInput.value = telefono;
        if (emailInput) emailInput.value = user.email || '';
        
        console.log('✅ Datos de usuario auto-completados');
        
      } catch (error) {
        console.error('❌ Error auto-completando datos:', error);
      }
    }
  }

  async confirmAppointment() {
    console.log('🎯 Confirmando turno:', this.appointmentData);
    
    try {
      // Preparar datos para el backend
      const appointmentData = {
        appointmentDate: this.appointmentData.date,
        appointmentTime: this.appointmentData.time,
        services: this.appointmentData.services.map(s => ({
          service_id: s.service_id,
          quantity: s.quantity
        })),
        serviceLocation: this.appointmentData.serviceLocation,
        clientName: this.appointmentData.clientName,
        clientPhone: this.appointmentData.clientPhone,
        clientEmail: this.appointmentData.clientEmail,
        service_type: this.appointmentData.services.map(s => s.name).join(', '),
        totalAmount: this.appointmentData.totalAmount
      };
      
      // Agregar userId si el usuario está logueado
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        appointmentData.userId = user.id;
      }
      
      console.log('📤 Enviando turno al backend:', appointmentData);
      
      // Enviar al backend
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Turno creado exitosamente:', result);
        this.showSuccess();
      } else {
        console.error('❌ Error creando turno:', result.message);
        alert(`Error: ${result.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error en confirmAppointment:', error);
      alert('Error al crear el turno. Por favor, intenta nuevamente.');
    }
  }

  showResumen() {
    const resumenContainer = document.getElementById('resumen-turno');
    if (!resumenContainer) return;
    
    let html = '';
    let total = 0;
    
    this.selectedServices.forEach(service => {
      const subtotal = service.price * service.quantity;
      total += subtotal;
      html += `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span>${service.name} x${service.quantity}</span>
          <span>$${subtotal.toLocaleString()}</span>
        </div>
      `;
    });
    
    html += `
      <hr>
      <div class="d-flex justify-content-between align-items-center">
        <strong>Total:</strong>
        <strong>$${total.toLocaleString()}</strong>
      </div>
      <hr>
      <div><strong>Fecha:</strong> ${this.appointmentData.date}</div>
      <div><strong>Hora:</strong> ${this.appointmentData.time}</div>
      <div><strong>Cliente:</strong> ${this.appointmentData.clientName}</div>
      <div><strong>Teléfono:</strong> ${this.appointmentData.clientPhone}</div>
      <div><strong>Dirección:</strong> ${this.appointmentData.serviceLocation}</div>
    `;
    
    resumenContainer.innerHTML = html;
  }

  showSuccess() {
    // Ocultar todos los pasos
    for (let i = 1; i <= 5; i++) {
      const stepDiv = document.getElementById(`step-${i}`);
      if (stepDiv) {
        stepDiv.style.display = 'none';
      }
    }
    
    // Mostrar mensaje de éxito
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.style.display = 'block';
    }
    
    // Ocultar botones
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    
    if (btnAnterior) btnAnterior.style.display = 'none';
    if (btnSiguiente) btnSiguiente.style.display = 'none';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.turnosApp = new TurnosApp();
});

// Función global para cambiar categoría (compatibilidad)
window.cambiarCategoria = function() {
  if (window.turnosApp) {
    window.turnosApp.changeCategory();
  }
}; 