// Sistema de Notificaciones Web para Daytona Clean Service
class NotificationManager {
  constructor() {
    this.notifications = [];
    this.isInitialized = false;
    this.checkInterval = null;
    this.init();
  }

  /**
   * Inicializar el sistema de notificaciones
   */
  init() {
    if (this.isInitialized) return;
    
    // Crear contenedor de notificaciones si no existe
    this.createNotificationContainer();
    
    // Verificar notificaciones cada 30 segundos
    this.startPolling();
    
    // Verificar notificaciones al cargar la página
    this.checkForNotifications();
    
    this.isInitialized = true;
    console.log('🔔 Sistema de notificaciones inicializado');
  }

  /**
   * Crear contenedor de notificaciones
   */
  createNotificationContainer() {
    if (document.getElementById('notification-container')) return;
    
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
    `;
    
    document.body.appendChild(container);
  }

  /**
   * Iniciar polling de notificaciones
   */
  startPolling() {
    this.checkInterval = setInterval(() => {
      this.checkForNotifications();
    }, 30000); // Verificar cada 30 segundos
  }

  /**
   * Detener polling
   */
  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Verificar notificaciones del servidor
   */
  async checkForNotifications() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://daytona-clean-service.onrender.com/api/notifications/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notifications) {
          data.notifications.forEach(notification => {
            this.showNotification(notification);
          });
        }
      }
    } catch (error) {
      console.log('No hay notificaciones nuevas o error de conexión');
    }
  }

  /**
   * Mostrar notificación
   */
  showNotification(notification) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${notification.type}`;
    notificationElement.style.cssText = `
      background: #232323;
      color: #fff;
      padding: 15px 20px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid #00d4ff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
      word-wrap: break-word;
    `;

    // Icono según el tipo de notificación
    let icon = '🔔';
    let borderColor = '#00d4ff';
    
    switch (notification.type) {
      case 'confirmation':
        icon = '✅';
        borderColor = '#28a745';
        break;
      case 'cancellation':
        icon = '❌';
        borderColor = '#dc3545';
        break;
      case 'reminder':
        icon = '⏰';
        borderColor = '#ffc107';
        break;
      case 'reschedule':
        icon = '🔄';
        borderColor = '#17a2b8';
        break;
    }

    notificationElement.style.borderLeftColor = borderColor;

    notificationElement.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <div style="font-size: 20px;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #00d4ff;">
            ${this.getNotificationTitle(notification.type)}
          </div>
          <div style="font-size: 14px; line-height: 1.4;">
            ${notification.message}
          </div>
          <div style="font-size: 12px; color: #888; margin-top: 8px;">
            ${new Date(notification.timestamp).toLocaleString('es-AR')}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: #888; cursor: pointer; font-size: 16px; padding: 0;">
          ×
        </button>
      </div>
    `;

    container.appendChild(notificationElement);

    // Animación de entrada
    setTimeout(() => {
      notificationElement.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.remove();
          }
        }, 300);
      }
    }, 10000);

    // Marcar como leída al hacer clic
    notificationElement.addEventListener('click', () => {
      this.markAsRead(notification.id);
    });
  }

  /**
   * Obtener título de la notificación
   */
  getNotificationTitle(type) {
    switch (type) {
      case 'confirmation':
        return 'Turno Confirmado';
      case 'cancellation':
        return 'Turno Cancelado';
      case 'reminder':
        return 'Recordatorio de Turno';
      case 'reschedule':
        return 'Turno Reprogramado';
      default:
        return 'Notificación';
    }
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`https://daytona-clean-service.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  /**
   * Mostrar notificación local (sin servidor)
   */
  showLocalNotification(message, type = 'info', duration = 5000) {
    const notification = {
      id: `local_${Date.now()}`,
      type: type,
      message: message,
      timestamp: new Date().toISOString()
    };

    this.showNotification(notification);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll() {
    const container = document.getElementById('notification-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * Destruir el sistema de notificaciones
   */
  destroy() {
    this.stopPolling();
    this.clearAll();
    this.isInitialized = false;
  }
}

// Inicializar sistema de notificaciones cuando se carga la página
let notificationManager;

document.addEventListener('DOMContentLoaded', function() {
  // Solo inicializar si el usuario está logueado
  const token = localStorage.getItem('token');
  if (token) {
    notificationManager = new NotificationManager();
  }
});

// Función global para mostrar notificaciones
window.showNotification = function(message, type = 'info', duration = 5000) {
  if (notificationManager) {
    notificationManager.showLocalNotification(message, type, duration);
  }
};

// Función para mostrar notificación de confirmación de turno
window.showAppointmentConfirmation = function(appointment) {
  const message = `✅ Tu turno ha sido confirmado para el ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.start_time}. ¡Te esperamos!`;
  window.showNotification(message, 'confirmation', 8000);
};

// Función para mostrar notificación de cancelación de turno
window.showAppointmentCancellation = function(appointment, reason) {
  const message = `❌ Tu turno del ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.start_time} ha sido cancelado. ${reason ? `Motivo: ${reason}` : ''}`;
  window.showNotification(message, 'cancellation', 8000);
};

// Función para mostrar notificación de recordatorio
window.showAppointmentReminder = function(appointment) {
  const message = `⏰ Recordatorio: Tu turno es hoy ${new Date(appointment.appointment_date).toLocaleDateString('es-AR')} a las ${appointment.start_time}. ¡No te olvides!`;
  window.showNotification(message, 'reminder', 8000);
}; 