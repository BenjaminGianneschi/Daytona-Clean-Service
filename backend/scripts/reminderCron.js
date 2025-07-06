const cron = require('node-cron');
const moment = require('moment');
const { query } = require('../config/database');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

class ReminderCron {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Iniciar el cron job para recordatorios
   */
  start() {
    // Ejecutar todos los días a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      await this.sendDailyReminders();
    }, {
      timezone: 'America/Argentina/Buenos_Aires'
    });

    logger.info('Reminder cron job started - running daily at 9:00 AM');
  }

  /**
   * Enviar recordatorios diarios
   */
  async sendDailyReminders() {
    if (this.isRunning) {
      logger.info('Reminder job already running, skipping...');
      return;
    }

    this.isRunning = true;
    logger.info('Starting daily reminder job...');

    try {
      // Obtener turnos para mañana que estén confirmados
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
      
      const appointments = await query(`
        SELECT 
          a.*,
          c.name as client_name,
          c.phone as client_phone,
          sl.address
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN service_locations sl ON a.id = sl.appointment_id
        WHERE a.appointment_date = ?
        AND a.status = 'confirmed'
        AND a.reminder_sent = 0
      `, [tomorrow]);

      logger.info(`Found ${appointments.length} appointments for tomorrow`);

      let successCount = 0;
      let errorCount = 0;

      for (const appointment of appointments) {
        try {
          // Enviar recordatorio
          const result = await whatsappService.sendReminder(appointment);
          
          if (result.success) {
            // Marcar como recordatorio enviado
            await query(
              'UPDATE appointments SET reminder_sent = 1 WHERE id = ?',
              [appointment.id]
            );
            
            successCount++;
            logger.info(`Reminder sent successfully for appointment #${appointment.id}`);
          } else {
            errorCount++;
            logger.error(`Failed to send reminder for appointment #${appointment.id}: ${result.message}`);
          }

          // Esperar 2 segundos entre envíos para no sobrecargar la API
          await this.sleep(2000);

        } catch (error) {
          errorCount++;
          logger.error(`Error processing reminder for appointment #${appointment.id}:`, error);
        }
      }

      logger.info(`Reminder job completed. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      logger.error('Error in daily reminder job:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Enviar recordatorio manual para un turno específico
   */
  async sendManualReminder(appointmentId) {
    try {
      const appointment = await query(`
        SELECT 
          a.*,
          c.name as client_name,
          c.phone as client_phone,
          sl.address
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN service_locations sl ON a.id = sl.appointment_id
        WHERE a.id = ?
        AND a.status = 'confirmed'
      `, [appointmentId]);

      if (appointment.length === 0) {
        return {
          success: false,
          message: 'Turno no encontrado o no confirmado'
        };
      }

      const result = await whatsappService.sendReminder(appointment[0]);
      
      if (result.success) {
        // Marcar como recordatorio enviado
        await query(
          'UPDATE appointments SET reminder_sent = 1 WHERE id = ?',
          [appointmentId]
        );
      }

      return result;

    } catch (error) {
      logger.error(`Error sending manual reminder for appointment #${appointmentId}:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Enviar recordatorio de reprogramación
   */
  async sendRescheduleReminder(appointmentId, newDate, newTime) {
    try {
      const appointment = await query(`
        SELECT 
          a.*,
          c.name as client_name,
          c.phone as client_phone,
          sl.address
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN service_locations sl ON a.id = sl.appointment_id
        WHERE a.id = ?
      `, [appointmentId]);

      if (appointment.length === 0) {
        return {
          success: false,
          message: 'Turno no encontrado'
        };
      }

      const result = await whatsappService.sendReschedule(appointment[0], newDate, newTime);
      return result;

    } catch (error) {
      logger.error(`Error sending reschedule reminder for appointment #${appointmentId}:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Limpiar recordatorios antiguos (más de 7 días)
   */
  async cleanOldReminders() {
    try {
      const weekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      const result = await query(
        'UPDATE appointments SET reminder_sent = 0 WHERE appointment_date < ? AND reminder_sent = 1',
        [weekAgo]
      );

      logger.info(`Cleaned ${result.affectedRows} old reminders`);
      return result.affectedRows;

    } catch (error) {
      logger.error('Error cleaning old reminders:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de recordatorios
   */
  async getReminderStats() {
    try {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_appointments,
          SUM(CASE WHEN reminder_sent = 1 THEN 1 ELSE 0 END) as reminders_sent,
          SUM(CASE WHEN reminder_sent = 0 AND status = 'confirmed' THEN 1 ELSE 0 END) as pending_reminders
        FROM appointments 
        WHERE appointment_date >= CURDATE()
        AND status = 'confirmed'
      `);

      return {
        success: true,
        data: stats[0]
      };

    } catch (error) {
      logger.error('Error getting reminder stats:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Función de utilidad para esperar
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Detener el cron job
   */
  stop() {
    logger.info('Stopping reminder cron job...');
    // El cron job se detendrá automáticamente cuando el proceso termine
  }
}

module.exports = new ReminderCron(); 