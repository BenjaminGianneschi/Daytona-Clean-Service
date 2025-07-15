const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.enabled = process.env.NOTIFICATIONS_ENABLED !== 'false';
  }

  /**
   * Enviar notificación de confirmación de turno
   */
  async sendConfirmationNotification(appointment) {
    if (!this.enabled) {
      logger.info('Notifications disabled');
      return { success: false, message: 'Notifications disabled' };
    }

    try {
      const results = {
        whatsapp: null,
        web: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendConfirmation(appointment);
        logger.info(`WhatsApp confirmation sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Enviar notificación web (se implementará con WebSockets)
      results.web = await this.sendWebNotification(appointment, 'confirmation');

      return {
        success: true,
        results,
        message: 'Confirmation notifications sent successfully'
      };

    } catch (error) {
      logger.error('Error sending confirmation notifications:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar notificación de cancelación de turno
   */
  async sendCancellationNotification(appointment, reason = 'Cancelado por el administrador') {
    if (!this.enabled) {
      return { success: false, message: 'Notifications disabled' };
    }

    try {
      const results = {
        whatsapp: null,
        web: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendCancellation(appointment, reason);
        logger.info(`WhatsApp cancellation sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Enviar notificación web
      results.web = await this.sendWebNotification(appointment, 'cancellation', reason);

      return {
        success: true,
        results,
        message: 'Cancellation notifications sent successfully'
      };

    } catch (error) {
      logger.error('Error sending cancellation notifications:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar notificación de recordatorio (día del turno)
   */
  async sendReminderNotification(appointment) {
    if (!this.enabled) {
      return { success: false, message: 'Notifications disabled' };
    }

    try {
      const results = {
        whatsapp: null,
        web: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendReminder(appointment);
        logger.info(`WhatsApp reminder sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Enviar notificación web
      results.web = await this.sendWebNotification(appointment, 'reminder');

      return {
        success: true,
        results,
        message: 'Reminder notifications sent successfully'
      };

    } catch (error) {
      logger.error('Error sending reminder notifications:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar notificación web (simulada - se implementará con WebSockets)
   */
  async sendWebNotification(appointment, type, reason = null) {
    try {
      // Por ahora simulamos la notificación web
      // En el futuro se implementará con WebSockets o Server-Sent Events
      const notification = {
        id: `notif_${Date.now()}`,
        type: type,
        appointmentId: appointment.id,
        clientName: appointment.client_name,
        clientEmail: appointment.client_email,
        message: this.formatWebNotificationMessage(appointment, type, reason),
        timestamp: new Date().toISOString(),
        read: false
      };

      logger.info(`Web notification created: ${notification.id} for appointment #${appointment.id}`);

      return {
        success: true,
        notification
      };

    } catch (error) {
      logger.error('Error sending web notification:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Formatear mensaje para notificación web
   */
  formatWebNotificationMessage(appointment, type, reason = null) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('es-AR');
    const time = appointment.appointment_time || 'No especificada';

    switch (type) {
      case 'confirmation':
        return `✅ Tu turno ha sido confirmado para el ${date} a las ${time}. ¡Te esperamos!`;
      
      case 'cancellation':
        return `❌ Tu turno del ${date} a las ${time} ha sido cancelado. ${reason ? `Motivo: ${reason}` : ''}`;
      
      case 'reminder':
        return `⏰ Recordatorio: Tu turno es hoy ${date} a las ${time}. ¡No te olvides!`;
      
      default:
        return `Notificación sobre tu turno del ${date}`;
    }
  }

  /**
   * Enviar notificación de reprogramación
   */
  async sendRescheduleNotification(appointment, newDate, newTime) {
    if (!this.enabled) {
      return { success: false, message: 'Notifications disabled' };
    }

    try {
      const results = {
        whatsapp: null,
        web: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendReschedule(appointment, newDate, newTime);
        logger.info(`WhatsApp reschedule sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Enviar notificación web
      results.web = await this.sendWebNotification(appointment, 'reschedule');

      return {
        success: true,
        results,
        message: 'Reschedule notifications sent successfully'
      };

    } catch (error) {
      logger.error('Error sending reschedule notifications:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Probar sistema de notificaciones
   */
  async testNotifications(testPhone = null) {
    try {
      const testAppointment = {
        id: 999,
        client_name: 'Cliente de Prueba',
        client_phone: testPhone || process.env.WHATSAPP_PHONE_NUMBER,
        client_email: 'test@example.com',
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        total_amount: 5000,
        services: [
          { service_name: 'Limpieza de Interior', quantity: 1 }
        ],
        address: 'Dirección de prueba'
      };

      const results = await Promise.all([
        this.sendConfirmationNotification(testAppointment),
        this.sendCancellationNotification(testAppointment, 'Prueba del sistema'),
        this.sendReminderNotification(testAppointment)
      ]);

      return {
        success: true,
        message: 'Test notifications sent successfully',
        results
      };

    } catch (error) {
      logger.error('Error testing notifications:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new NotificationService(); 