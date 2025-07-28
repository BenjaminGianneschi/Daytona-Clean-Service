// Servicio para manejo de turnos - Daytona Clean Service
class TurnosService {
  constructor() {
    this.baseUrl = '/api/appointments';
  }

  // Obtener disponibilidad de horarios para una fecha
  async getAvailability(date) {
    try {
      const response = await fetch(`${this.baseUrl}/availability/${date}`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          availableHours: data.availableHours || [],
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener disponibilidad'
        };
      }
    } catch (error) {
      console.error('Error obteniendo disponibilidad:', error);
      return {
        success: false,
        message: 'Error de conexión al servidor'
      };
    }
  }

  // Crear un nuevo turno
  async createAppointment(appointmentData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          appointmentId: data.appointmentId,
          message: data.message || 'Turno creado exitosamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear el turno'
        };
      }
    } catch (error) {
      console.error('Error creando turno:', error);
      return {
        success: false,
        message: 'Error de conexión al servidor'
      };
    }
  }

  // Obtener todos los servicios disponibles
  async getServices() {
    try {
      const response = await fetch(`${this.baseUrl}/services`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          services: data.services || []
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener servicios'
        };
      }
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
      return {
        success: false,
        message: 'Error de conexión al servidor'
      };
    }
  }

  // Cargar horarios disponibles en un select
  async loadAvailableHours(date, selectId) {
    const result = await this.getAvailability(date);
    
    if (result.success) {
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">Selecciona una hora</option>';
        result.availableHours.forEach(hora => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          select.appendChild(option);
        });
        return true;
      }
    } else {
      console.error('Error al cargar horarios:', result.message);
      return false;
    }
  }

  // Validar datos del turno antes de enviar
  validateAppointmentData(data) {
    const errors = [];
    
    if (!data.appointmentDate) errors.push('Fecha es obligatoria');
    if (!data.appointmentTime) errors.push('Hora es obligatoria');
    if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
      errors.push('Debe seleccionar al menos un servicio');
    }
    if (!data.serviceLocation || data.serviceLocation.trim() === '') {
      errors.push('Dirección es obligatoria');
    }
    if (!data.clientName || data.clientName.trim() === '') {
      errors.push('Nombre del cliente es obligatorio');
    }
    if (!data.clientPhone || data.clientPhone.trim() === '') {
      errors.push('Teléfono del cliente es obligatorio');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatear datos del turno para el backend
  formatAppointmentData(rawData) {
    return {
      appointmentDate: rawData.appointmentDate,
      appointmentTime: rawData.appointmentTime,
      services: rawData.services.map(s => ({
        service_id: s.service_id,
        quantity: s.cantidad || 1
      })),
      serviceLocation: rawData.serviceLocation,
      clientName: rawData.clientName,
      clientPhone: rawData.clientPhone,
      clientEmail: rawData.clientEmail || '',
      service_type: rawData.service_type,
      totalAmount: rawData.totalAmount,
      userId: rawData.userId || null
    };
  }
}

// Exportar para uso global
window.TurnosService = TurnosService; 