const whatsappService = require('./whatsappService');
const notificationModel = require('../models/notificationModel');
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
        inApp: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendConfirmation(appointment);
        logger.info(`WhatsApp confirmation sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Crear notificación in-app
      if (appointment.user_id) {
        results.inApp = await notificationModel.createConfirmationNotification(appointment);
        logger.info(`In-app notification created for appointment #${appointment.id}`);
      }

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
        inApp: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendCancellation(appointment, reason);
        logger.info(`WhatsApp cancellation sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Crear notificación in-app
      if (appointment.user_id) {
        results.inApp = await notificationModel.createCancellationNotification(appointment, reason);
        logger.info(`In-app cancellation notification created for appointment #${appointment.id}`);
      }

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
        inApp: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendReminder(appointment);
        logger.info(`WhatsApp reminder sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Crear notificación in-app
      if (appointment.user_id) {
        results.inApp = await notificationModel.createReminderNotification(appointment);
        logger.info(`In-app reminder notification created for appointment #${appointment.id}`);
      }

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
   * Enviar notificación de reprogramación
   */
  async sendRescheduleNotification(appointment, newDate, newTime) {
    if (!this.enabled) {
      return { success: false, message: 'Notifications disabled' };
    }

    try {
      const results = {
        whatsapp: null,
        inApp: null
      };

      // Enviar WhatsApp
      if (appointment.client_phone) {
        results.whatsapp = await whatsappService.sendReschedule(appointment, newDate, newTime);
        logger.info(`WhatsApp reschedule sent to ${appointment.client_phone} for appointment #${appointment.id}`);
      }

      // Crear notificación in-app
      if (appointment.user_id) {
        results.inApp = await notificationModel.createRescheduleNotification(appointment, newDate, newTime);
        logger.info(`In-app reschedule notification created for appointment #${appointment.id}`);
      }

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
        user_id: 1, // Usuario de prueba
        client_name: 'Cliente de Prueba',
        client_phone: testPhone || process.env.WHATSAPP_PHONE_NUMBER,
        client_email: 'test@example.com',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:00',
        total_amount: 5000,
        services: [
          { service_name: 'Limpieza de Interior', quantity: 1 }
        ],
        service_location: 'Dirección de prueba'
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