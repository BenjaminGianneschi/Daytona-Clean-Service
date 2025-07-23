// Servicio de API para comunicarse con el backend
class ApiService {
  constructor() {
    // Usar la configuración centralizada
    this.baseURL = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
    this.token = localStorage.getItem('adminToken');
  }

  // Configurar headers para requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token'); // Usar la misma clave que el login
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }

  // Obtener disponibilidad para una fecha
  async getAvailability(date, duration = null) {
    let endpoint = `/appointments/availability/${date}`;
    if (duration) {
      endpoint += `?duration=${duration}`;
    }
    return this.request(endpoint);
  }

  // Crear nuevo turno
  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }



  // Verificar token
  async verifyToken() {
    return this.request('/auth/verify');
  }



  // Logout
  logout() {
    this.token = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // Obtener todos los turnos (admin)
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/appointments?${queryString}`);
  }

  // Obtener turno específico (admin)
  async getAppointment(id) {
    return this.request(`/appointments/${id}`);
  }

  // Actualizar estado del turno (admin)
  async updateAppointmentStatus(id, status) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Cancelar turno (admin)
  async cancelAppointment(id, reason) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Cambiar contraseña (admin)
  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // Crear nuevo administrador (super admin)
  async createAdmin(adminData) {
    return this.request('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData)
    });
  }

  // Verificar estado de la API
  async checkHealth() {
    return this.request('/health');
  }
}

// Instancia global del servicio de API (solo si no existe)
if (!window.apiService) {
  window.apiService = new ApiService();
} 