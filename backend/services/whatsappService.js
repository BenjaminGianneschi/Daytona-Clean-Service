const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
    this.phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
  }

  /**
   * Enviar mensaje de confirmación de turno
   */
  async sendConfirmation(appointment) {
    if (!this.enabled) {
      logger.info('WhatsApp notifications disabled');
      return { success: false, message: 'WhatsApp notifications disabled' };
    }

    try {
      const message = this.formatConfirmationMessage(appointment);
      const phone = this.formatPhoneNumber(appointment.client_phone);
      
      const result = await this.sendMessage(phone, message);
      
      logger.info(`Confirmation sent to ${phone} for appointment #${appointment.id}`);
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('Error sending confirmation WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar mensaje de recordatorio (24h antes)
   */
  async sendReminder(appointment) {
    if (!this.enabled) {
      return { success: false, message: 'WhatsApp notifications disabled' };
    }

    try {
      const message = this.formatReminderMessage(appointment);
      const phone = this.formatPhoneNumber(appointment.client_phone);
      
      const result = await this.sendMessage(phone, message);
      
      logger.info(`Reminder sent to ${phone} for appointment #${appointment.id}`);
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('Error sending reminder WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar mensaje de cancelación
   */
  async sendCancellation(appointment, reason) {
    if (!this.enabled) {
      return { success: false, message: 'WhatsApp notifications disabled' };
    }

    try {
      const message = this.formatCancellationMessage(appointment, reason);
      const phone = this.formatPhoneNumber(appointment.client_phone);
      
      const result = await this.sendMessage(phone, message);
      
      logger.info(`Cancellation sent to ${phone} for appointment #${appointment.id}`);
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('Error sending cancellation WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar mensaje de reprogramación
   */
  async sendReschedule(appointment, newDate, newTime) {
    if (!this.enabled) {
      return { success: false, message: 'WhatsApp notifications disabled' };
    }

    try {
      const message = this.formatRescheduleMessage(appointment, newDate, newTime);
      const phone = this.formatPhoneNumber(appointment.client_phone);
      
      const result = await this.sendMessage(phone, message);
      
      logger.info(`Reschedule sent to ${phone} for appointment #${appointment.id}`);
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('Error sending reschedule WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar mensaje personalizado
   */
  async sendCustomMessage(phone, message) {
    if (!this.enabled) {
      return { success: false, message: 'WhatsApp notifications disabled' };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const result = await this.sendMessage(formattedPhone, message);
      
      logger.info(`Custom message sent to ${formattedPhone}`);
      return { success: true, data: result };
      
    } catch (error) {
      logger.error('Error sending custom WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Enviar mensaje usando la API de WhatsApp
   */
  async sendMessage(phone, message) {
    // Usar WhatsApp Web API o servicio externo
    if (this.apiKey) {
      // Implementar con API externa (ej: Twilio, MessageBird, etc.)
      return await this.sendViaAPI(phone, message);
    } else {
      // Usar WhatsApp Web directo
      return await this.sendViaWeb(phone, message);
    }
  }

  /**
   * Enviar via API externa
   */
  async sendViaAPI(phone, message) {
    try {
      const response = await axios.post(this.apiUrl, {
        phone: phone,
        message: message,
        apiKey: this.apiKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Enviar via WhatsApp Web (simulado)
   */
  async sendViaWeb(phone, message) {
    // Simular envío por WhatsApp Web
    // En producción, usar librería como whatsapp-web.js
    logger.info(`WhatsApp Web message to ${phone}: ${message}`);
    
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formatear mensaje de confirmación
   */
  formatConfirmationMessage(appointment) {
    const services = appointment.services.map(s => 
      `• ${s.service_name} x${s.quantity}`
    ).join('\n');

    const date = new Date(appointment.appointment_date).toLocaleDateString('es-AR');
    
    return `¡Hola ${appointment.client_name}! 🎉

✅ Tu turno ha sido confirmado exitosamente:

📅 *Fecha:* ${date}
⏰ *Hora:* ${appointment.start_time}
📍 *Dirección:* ${appointment.address || 'A confirmar'}
💰 *Total:* $${parseFloat(appointment.total_amount).toLocaleString()}

🛠️ *Servicios:*
${services}

📞 *Contacto:* ${appointment.client_phone}

⚠️ *Importante:*
• Llegá 10 minutos antes del horario
• Si necesitás cancelar, avisanos con 24h de anticipación
• Traé los elementos necesarios para el servicio

¡Gracias por elegir Daytona Clean Service! 🚗✨

Para consultas: ${this.phoneNumber}`;
  }

  /**
   * Formatear mensaje de recordatorio
   */
  formatReminderMessage(appointment) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('es-AR');
    
    return `¡Hola ${appointment.client_name}! ⏰

📅 *Recordatorio:* Tu turno es mañana

📅 *Fecha:* ${date}
⏰ *Hora:* ${appointment.start_time}
📍 *Dirección:* ${appointment.address || 'A confirmar'}

⚠️ *Recordá:*
• Llegá 10 minutos antes
• Traé los elementos necesarios
• Si no podés venir, avisanos lo antes posible

¡Te esperamos! 🚗✨

Para consultas: ${this.phoneNumber}`;
  }

  /**
   * Formatear mensaje de cancelación
   */
  formatCancellationMessage(appointment, reason) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('es-AR');
    
    return `¡Hola ${appointment.client_name}! 😔

❌ Tu turno ha sido cancelado

📅 *Fecha:* ${date}
⏰ *Hora:* ${appointment.start_time}
📝 *Motivo:* ${reason}

🔄 *¿Qué hacer?*
• Podés reagendar tu turno cuando quieras
• Contactanos para coordinar nueva fecha
• No se te cobrará ningún cargo

¡Disculpá las molestias! 🙏

Para reagendar: ${this.phoneNumber}`;
  }

  /**
   * Formatear mensaje de reprogramación
   */
  formatRescheduleMessage(appointment, newDate, newTime) {
    const oldDate = new Date(appointment.appointment_date).toLocaleDateString('es-AR');
    const newDateFormatted = new Date(newDate).toLocaleDateString('es-AR');
    
    return `¡Hola ${appointment.client_name}! 🔄

📅 Tu turno ha sido reprogramado

❌ *Fecha anterior:* ${oldDate} a las ${appointment.start_time}
✅ *Nueva fecha:* ${newDateFormatted} a las ${newTime}

📍 *Dirección:* ${appointment.address || 'A confirmar'}

⚠️ *Recordá:*
• Llegá 10 minutos antes del nuevo horario
• Si no podés venir, avisanos con anticipación

¡Gracias por tu paciencia! 🚗✨

Para consultas: ${this.phoneNumber}`;
  }

  /**
   * Formatear número de teléfono
   */
  formatPhoneNumber(phone) {
    // Remover caracteres no numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Agregar código de país si no está presente
    if (!cleaned.startsWith('54')) {
      cleaned = '54' + cleaned;
    }
    
    // Agregar + al inicio
    return '+' + cleaned;
  }

  /**
   * Verificar si el número es válido
   */
  isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Obtener estadísticas de envíos
   */
  async getStats() {
    // Implementar estadísticas de envíos
    return {
      totalSent: 0,
      successful: 0,
      failed: 0,
      lastSent: null
    };
  }

  /**
   * Probar conexión
   */
  async testConnection() {
    try {
      const testMessage = 'Test message from Daytona Admin Panel';
      const result = await this.sendCustomMessage(this.phoneNumber, testMessage);
      
      return {
        success: result.success,
        message: result.success ? 'Conexión exitosa' : result.message
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error.message}`
      };
    }
  }
}

module.exports = new WhatsAppService(); 