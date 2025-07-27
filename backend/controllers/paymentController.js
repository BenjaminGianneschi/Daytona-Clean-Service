const paymentModel = require('../models/paymentModel');
const appointmentModel = require('../models/appointmentModel');

// Importar logger de manera segura
let logger;
try {
  logger = require('../utils/logger');
} catch (error) {
  console.error('Error importando logger:', error.message);
  // Crear un logger de fallback
  logger = {
    info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
    error: (msg, error) => console.error(`[ERROR] ${msg}`, error || ''),
    warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
    debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data || ''),
    success: (msg, data) => console.log(`[SUCCESS] ${msg}`, data || '')
  };
}

// Crear preferencia de pago
async function createPaymentPreference(req, res) {
  try {
    const { appointmentId, amount, title, description } = req.body;
    const userId = req.user ? req.user.id : null;

    // Si no hay usuario autenticado, verificar que el turno no tenga userId
    if (!userId) {
      logger.info(`Creando preferencia de pago sin usuario autenticado para turno ${appointmentId}`);
    }

    // Validaciones
    if (!appointmentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId y amount son obligatorios'
      });
    }

    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Verificar que el turno no tenga pago aprobado
    const existingPayment = await paymentModel.getPaymentByAppointmentId(appointmentId);
    if (existingPayment && existingPayment.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Este turno ya tiene un pago aprobado'
      });
    }

    // Crear preferencia de pago
    const paymentData = {
      appointmentId,
      userId,
      amount: parseFloat(amount),
      title: title || `Servicio: ${appointment.service_type}`,
      description: description || `Turno para ${appointment.appointment_date} a las ${appointment.appointment_time}`,
      payerEmail: appointment.client_email || 'cliente@daytona.com.ar'
    };

    const preference = await paymentModel.createPaymentPreference(paymentData);

    logger.info(`Preferencia de pago creada: ID ${preference.paymentId} para turno ${appointmentId}`);

    res.json({
      success: true,
      data: preference
    });

  } catch (error) {
    console.error('Error creando preferencia de pago:', error);
    logger.error('Error creando preferencia de pago:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
}

// Procesar webhook de Mercado Pago
async function processWebhook(req, res) {
  try {
    const webhookData = req.body;

    logger.info('Webhook recibido:', webhookData);

    // Procesar webhook
    const result = await paymentModel.processWebhook(webhookData);

    if (result.success) {
      logger.info(`Webhook procesado exitosamente. Status: ${result.status}`);
    } else {
      logger.warn(`Webhook no procesado: ${result.message}`);
    }

    // Mercado Pago espera un 200 OK
    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Error procesando webhook:', error);
    // Aún así devolver 200 para que Mercado Pago no reintente
    res.status(200).json({ success: false, error: error.message });
  }
}

// Obtener pago por ID
async function getPayment(req, res) {
  try {
    const { paymentId } = req.params;

    const payment = await paymentModel.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.error('Error obteniendo pago:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
}

// Obtener detalles del turno por preference_id
async function getAppointmentByPreference(req, res) {
  try {
    const { preferenceId } = req.params;

    const payment = await paymentModel.getPaymentByPreferenceId(preferenceId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Obtener detalles del turno
    const appointment = await appointmentModel.getAppointmentById(payment.appointment_id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    logger.error('Error obteniendo turno por preference:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
}

// Obtener pago por appointment ID
async function getPaymentByAppointment(req, res) {
  try {
    const { appointmentId } = req.params;

    const payment = await paymentModel.getPaymentByAppointmentId(appointmentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.error('Error obteniendo pago por turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener pagos del usuario
async function getUserPayments(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const payments = await paymentModel.getUserPayments(userId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    logger.error('Error obteniendo pagos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener todos los pagos (admin)
async function getAllPayments(req, res) {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const payments = await paymentModel.getAllPayments(parseInt(limit), parseInt(offset), status);

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    logger.error('Error obteniendo todos los pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Obtener estadísticas de pagos (admin)
async function getPaymentStats(req, res) {
  try {
    const stats = await paymentModel.getPaymentStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Verificar estado de pago
async function checkPaymentStatus(req, res) {
  try {
    const { paymentId } = req.params;

    const payment = await paymentModel.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Si es un pago de Mercado Pago, verificar estado actual
    if (payment.mercadopago_payment_id) {
      const mpStatus = await paymentModel.checkPaymentStatus(payment.mercadopago_payment_id);
      
      res.json({
        success: true,
        data: {
          localStatus: payment.status,
          mercadopagoStatus: mpStatus.status,
          lastUpdated: payment.updated_at
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          status: payment.status,
          lastUpdated: payment.updated_at
        }
      });
    }

  } catch (error) {
    logger.error('Error verificando estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Crear pago en efectivo (admin)
async function createCashPayment(req, res) {
  try {
    const { appointmentId, amount, notes } = req.body;
    const adminId = req.user.id;

    // Validaciones
    if (!appointmentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId y amount son obligatorios'
      });
    }

    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Crear pago en efectivo
    const paymentData = {
      appointmentId,
      userId: appointment.user_id,
      amount: parseFloat(amount),
      notes: notes || 'Pago en efectivo registrado por administrador'
    };

    const paymentId = await paymentModel.createCashPayment(paymentData);

    logger.info(`Pago en efectivo creado: ID ${paymentId} para turno ${appointmentId} por admin ${adminId}`);

    res.status(201).json({
      success: true,
      message: 'Pago en efectivo registrado exitosamente',
      data: { paymentId }
    });

  } catch (error) {
    logger.error('Error creando pago en efectivo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
}

// Obtener métodos de pago disponibles
async function getPaymentMethods(req, res) {
  try {
    const methods = await paymentModel.getPaymentMethods();

    res.json({
      success: true,
      data: methods
    });

  } catch (error) {
    logger.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}

// Reembolsar pago (admin)
async function refundPayment(req, res) {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;
    const adminId = req.user.id;

    const result = await paymentModel.refundPayment(paymentId, amount);

    logger.info(`Reembolso procesado: Pago ${paymentId} por admin ${adminId}`);

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: result
    });

  } catch (error) {
    logger.error('Error procesando reembolso:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
}

module.exports = {
  createPaymentPreference,
  processWebhook,
  getPayment,
  getAppointmentByPreference,
  getPaymentByAppointment,
  getUserPayments,
  getAllPayments,
  getPaymentStats,
  checkPaymentStatus,
  createCashPayment,
  getPaymentMethods,
  refundPayment
}; 