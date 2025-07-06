// Panel de Administración - Daytona Clean Service

class AdminPanel {
  constructor() {
    this.currentUser = null;
    this.appointments = [];
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.searchTerm = '';
    
    this.init();
  }

  async init() {
    // Verificar si ya está logueado
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const response = await apiService.verifyToken();
        if (response.success) {
          this.currentUser = response.data.user;
          this.showDashboard();
          this.loadDashboard();
        } else {
          this.showLogin();
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        this.showLogin();
      }
    } else {
      this.showLogin();
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.login();
      });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchAppointments();
        }
      });
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword();
      });
    }
  }

  showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
  }

  showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    if (this.currentUser) {
      document.getElementById('currentUser').textContent = this.currentUser.username;
    }
  }

  async login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
      const response = await apiService.login({ username, password });
      
      if (response.success) {
        this.currentUser = response.data.user;
        this.showDashboard();
        this.loadDashboard();
        this.showToast('¡Bienvenido!', 'success');
      } else {
        errorDiv.textContent = response.message || 'Error en el login';
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error en login:', error);
      errorDiv.textContent = 'Error de conexión. Inténtalo nuevamente.';
      errorDiv.style.display = 'block';
    }
  }

  logout() {
    apiService.logout();
    this.currentUser = null;
    this.showLogin();
    this.showToast('Sesión cerrada', 'info');
  }

  async loadDashboard() {
    try {
      await this.loadStats();
      await this.loadAppointments();
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      this.showToast('Error cargando datos', 'error');
    }
  }

  async loadStats() {
    try {
      const response = await apiService.getAppointments();
      
      if (response.success) {
        const appointments = response.data.appointments;
        
        // Calcular estadísticas
        const total = appointments.length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const today = appointments.filter(a => {
          const today = new Date().toISOString().split('T')[0];
          return a.appointment_date === today;
        }).length;
        const revenue = appointments
          .filter(a => a.status === 'confirmed' || a.status === 'completed')
          .reduce((sum, a) => sum + parseFloat(a.total_amount), 0);

        // Actualizar UI
        document.getElementById('totalAppointments').textContent = total;
        document.getElementById('pendingAppointments').textContent = pending;
        document.getElementById('todayAppointments').textContent = today;
        document.getElementById('totalRevenue').textContent = `$${revenue.toLocaleString()}`;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  async loadAppointments() {
    try {
      const params = {
        page: this.currentPage,
        limit: this.itemsPerPage,
        status: this.currentFilter !== 'all' ? this.currentFilter : undefined,
        search: this.searchTerm || undefined
      };

      const response = await apiService.getAppointments(params);
      
      if (response.success) {
        this.appointments = response.data.appointments;
        this.renderAppointmentsTable();
        this.renderPagination(response.data.total, response.data.pages);
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
      this.showToast('Error cargando turnos', 'error');
    }
  }

  renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (this.appointments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
            <p class="text-muted">No se encontraron turnos</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.appointments.map(appointment => `
      <tr>
        <td>#${appointment.id}</td>
        <td>
          <div>
            <strong>${appointment.client_name}</strong><br>
            <small class="text-muted">${appointment.client_phone}</small>
          </div>
        </td>
        <td>${this.formatDate(appointment.appointment_date)}</td>
        <td>${appointment.start_time}</td>
        <td>
          <div class="text-truncate-2" title="${this.getServicesText(appointment.services)}">
            ${this.getServicesText(appointment.services)}
          </div>
        </td>
        <td>$${parseFloat(appointment.total_amount).toLocaleString()}</td>
        <td>
          <span class="badge badge-${appointment.status}">
            ${this.getStatusText(appointment.status)}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action" onclick="adminPanel.viewAppointment(${appointment.id})">
            <i class="fas fa-eye"></i>
          </button>
          ${appointment.status === 'pending' ? `
            <button class="btn btn-sm btn-outline-success btn-action" onclick="adminPanel.confirmAppointment(${appointment.id})">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-action" onclick="adminPanel.cancelAppointment(${appointment.id})">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  renderPagination(total, pages) {
    const pagination = document.getElementById('pagination');
    
    if (pages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="adminPanel.changePage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;

    // Páginas
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `
          <li class="page-item ${i === this.currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="adminPanel.changePage(${i})">${i}</a>
          </li>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }

    // Botón siguiente
    paginationHTML += `
      <li class="page-item ${this.currentPage === pages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="adminPanel.changePage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    pagination.innerHTML = paginationHTML;
  }

  async changePage(page) {
    this.currentPage = page;
    await this.loadAppointments();
  }

  filterAppointments(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadAppointments();
    
    // Actualizar botones activos
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  searchAppointments() {
    this.searchTerm = document.getElementById('searchInput').value;
    this.currentPage = 1;
    this.loadAppointments();
  }

  async viewAppointment(id) {
    try {
      const response = await apiService.getAppointment(id);
      
      if (response.success) {
        const appointment = response.data;
        this.showAppointmentModal(appointment);
      }
    } catch (error) {
      console.error('Error cargando turno:', error);
      this.showToast('Error cargando turno', 'error');
    }
  }

  showAppointmentModal(appointment) {
    const modalBody = document.getElementById('appointmentModalBody');
    
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6>Información del Cliente</h6>
          <p><strong>Nombre:</strong> ${appointment.client_name}</p>
          <p><strong>Teléfono:</strong> ${appointment.client_phone}</p>
          <p><strong>Email:</strong> ${appointment.client_email || 'No especificado'}</p>
        </div>
        <div class="col-md-6">
          <h6>Detalles del Turno</h6>
          <p><strong>Fecha:</strong> ${this.formatDate(appointment.appointment_date)}</p>
          <p><strong>Hora:</strong> ${appointment.start_time}</p>
          <p><strong>Estado:</strong> 
            <span class="badge badge-${appointment.status}">
              ${this.getStatusText(appointment.status)}
            </span>
          </p>
          <p><strong>Total:</strong> $${parseFloat(appointment.total_amount).toLocaleString()}</p>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12">
          <h6>Servicios</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${appointment.services.map(service => `
                  <tr>
                    <td>${service.service_name}</td>
                    <td>${service.quantity}</td>
                    <td>$${parseFloat(service.price).toLocaleString()}</td>
                    <td>$${parseFloat(service.total_price).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      ${appointment.notes ? `
        <div class="row mt-3">
          <div class="col-12">
            <h6>Notas</h6>
            <p class="text-muted">${appointment.notes}</p>
          </div>
        </div>
      ` : ''}
      
      ${appointment.address ? `
        <div class="row mt-3">
          <div class="col-12">
            <h6>Dirección</h6>
            <p class="text-muted">${appointment.address}</p>
          </div>
        </div>
      ` : ''}
    `;

    // Guardar ID del turno actual para las acciones
    this.currentAppointmentId = appointment.id;
    
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();
  }

  async confirmAppointment(id = this.currentAppointmentId) {
    try {
      const response = await apiService.updateAppointmentStatus(id, 'confirmed');
      
      if (response.success) {
        this.showToast('Turno confirmado exitosamente', 'success');
        this.loadDashboard();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
        if (modal) modal.hide();
      }
    } catch (error) {
      console.error('Error confirmando turno:', error);
      this.showToast('Error confirmando turno', 'error');
    }
  }

  async cancelAppointment(id = this.currentAppointmentId) {
    const reason = prompt('Motivo de la cancelación:');
    if (!reason) return;

    try {
      const response = await apiService.cancelAppointment(id, reason);
      
      if (response.success) {
        this.showToast('Turno cancelado exitosamente', 'success');
        this.loadDashboard();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
        if (modal) modal.hide();
      }
    } catch (error) {
      console.error('Error cancelando turno:', error);
      this.showToast('Error cancelando turno', 'error');
    }
  }

  showChangePasswordModal() {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
  }

  async changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        this.showToast('Contraseña cambiada exitosamente', 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
        if (modal) modal.hide();
        
        // Limpiar formulario
        document.getElementById('changePasswordForm').reset();
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      this.showToast('Error cambiando contraseña', 'error');
    }
  }

  showSettingsModal() {
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
  }

  async saveSettings() {
    // Implementar guardado de configuración
    this.showToast('Configuración guardada', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    if (modal) modal.hide();
  }

  exportAppointments() {
    // Implementar exportación de turnos
    this.showToast('Exportando turnos...', 'info');
  }

  // Utility functions
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  }

  getServicesText(services) {
    return services.map(s => `${s.service_name} x${s.quantity}`).join(', ');
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'cancelled': 'Cancelado',
      'completed': 'Completado'
    };
    return statusMap[status] || status;
  }

  showToast(message, type = 'info') {
    // Crear toast notification
    const toastHTML = `
      <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    `;

    // Agregar al DOM
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);

    // Mostrar toast
    const toastElement = toastContainer.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remover después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
      document.body.removeChild(toastContainer);
    });
  }
}

// Inicializar panel de administración
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
  adminPanel = new AdminPanel();
});

// Funciones globales para los botones
function filterAppointments(filter) {
  adminPanel.filterAppointments(filter);
}

function searchAppointments() {
  adminPanel.searchAppointments();
}

function showChangePasswordModal() {
  adminPanel.showChangePasswordModal();
}

function showSettingsModal() {
  adminPanel.showSettingsModal();
}

function exportAppointments() {
  adminPanel.exportAppointments();
}

function logout() {
  adminPanel.logout();
} 