const { query } = require('../config/database');
const mercadopago = require('mercadopago');

// Función para configurar Mercado Pago
function configureMercadoPago() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN no configurado');
    return false;
  }
  
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
  });
  return true;
}

// Crear preferencia de pago
async function createPaymentPreference(paymentData) {
  const { appointmentId, userId, amount, title, description, payerEmail } = paymentData;

  // Configurar Mercado Pago
  if (!configureMercadoPago()) {
    throw new Error('Mercado Pago no está configurado. Contacta al administrador.');
  }

  try {
    // Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          title: title || 'Servicio de Limpieza - Daytona Clean Service',
          unit_price: parseFloat(amount),
          quantity: 1,
          description: description || 'Servicio de limpieza profesional'
        }
      ],
      payer: {
        email: payerEmail
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment-success`,
        failure: `${process.env.FRONTEND_URL}/payment-failure`,
        pending: `${process.env.FRONTEND_URL}/payment-pending`
      },
      auto_return: 'approved',
      external_reference: appointmentId.toString(),
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    const response = await mercadopago.preferences.create(preference);

    // Guardar en base de datos
    const result = await query(
      `INSERT INTO payments (appointment_id, user_id, mercadopago_preference_id, amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [appointmentId, userId, response.body.id, amount]
    );

    return {
      paymentId: result[0].id,
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point
    };

  } catch (error) {
    console.error('Error creando preferencia de pago:', error);
    throw new Error('Error al crear la preferencia de pago');
  }
}

// Procesar webhook de Mercado Pago
async function processWebhook(webhookData) {
  // Configurar Mercado Pago
  if (!configureMercadoPago()) {
    throw new Error('Mercado Pago no está configurado. Contacta al administrador.');
  }

  try {
    const { data } = webhookData;
    
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      
      // Obtener información del pago desde Mercado Pago
      const payment = await mercadopago.payment.findById(paymentId);
      
      // Guardar webhook en base de datos
      await query(
        `INSERT INTO payment_webhooks (mercadopago_payment_id, webhook_data, created_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [paymentId, JSON.stringify(webhookData)]
      );

      // Actualizar pago en base de datos
      const paymentStatus = payment.body.status;
      const appointmentId = payment.body.external_reference;
      
      await query(
        `UPDATE payments 
         SET mercadopago_payment_id = $1, 
             status = $2, 
             payment_type = $3,
             installments = $4,
             transaction_details = $5,
             updated_at = CURRENT_TIMESTAMP,
             paid_at = CASE WHEN $2 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE mercadopago_preference_id = $6`,
        [
          paymentId,
          paymentStatus,
          payment.body.payment_type_id,
          payment.body.installments || 1,
          JSON.stringify(payment.body),
          payment.body.preference_id
        ]
      );

      // Actualizar estado del turno
      if (paymentStatus === 'approved') {
        await query(
          `UPDATE appointments 
           SET payment_status = 'paid', 
               status = 'confirmed',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [appointmentId]
        );
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        await query(
          `UPDATE appointments 
           SET payment_status = 'failed', 
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [appointmentId]
        );
      }

      // Marcar webhook como procesado
      await query(
        `UPDATE payment_webhooks 
         SET processed = TRUE 
         WHERE mercadopago_payment_id = $1`,
        [paymentId]
      );

      return { success: true, status: paymentStatus };
    }

    return { success: false, message: 'Tipo de webhook no soportado' };

  } catch (error) {
    console.error('Error procesando webhook:', error);
    throw new Error('Error al procesar el webhook');
  }
}

// Obtener pago por ID
async function getPaymentById(paymentId) {
  const payments = await query(
    `SELECT * FROM payments_with_details WHERE id = $1`,
    [paymentId]
  );
  
  return payments[0] || null;
}

// Obtener pago por appointment ID
async function getPaymentByAppointmentId(appointmentId) {
  const payments = await query(
    `SELECT * FROM payments_with_details WHERE appointment_id = $1`,
    [appointmentId]
  );
  
  return payments[0] || null;
}

// Obtener pagos de un usuario
async function getUserPayments(userId, limit = 10, offset = 0) {
  const payments = await query(
    `SELECT * FROM payments_with_details 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  return payments;
}

// Obtener todos los pagos (admin)
async function getAllPayments(limit = 50, offset = 0, status = null) {
  let sql = `SELECT * FROM payments_with_details ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
  let params = [limit, offset];
  
  if (status) {
    sql = `SELECT * FROM payments_with_details WHERE status = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    params.push(status);
  }
  
  const payments = await query(sql, params);
  return payments;
}

// Obtener estadísticas de pagos
async function getPaymentStats() {
  const stats = await query('SELECT * FROM get_payment_stats()');
  return stats[0];
}

// Verificar estado de pago en Mercado Pago
async function checkPaymentStatus(paymentId) {
  // Configurar Mercado Pago
  if (!configureMercadoPago()) {
    throw new Error('Mercado Pago no está configurado. Contacta al administrador.');
  }

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    return payment.body;
  } catch (error) {
    console.error('Error verificando estado de pago:', error);
    throw new Error('Error al verificar el estado del pago');
  }
}

// Crear pago en efectivo
async function createCashPayment(paymentData) {
  const { appointmentId, userId, amount, notes } = paymentData;

  try {
    const result = await query(
      `INSERT INTO payments (appointment_id, user_id, amount, status, payment_type, transaction_details, created_at, updated_at)
       VALUES ($1, $2, $3, 'approved', 'cash', $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [appointmentId, userId, amount, JSON.stringify({ notes, method: 'cash' })]
    );

    // Actualizar turno
    await query(
      `UPDATE appointments 
       SET payment_status = 'paid', 
           status = 'confirmed',
           payment_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [result[0].id, appointmentId]
    );

    return result[0].id;

  } catch (error) {
    console.error('Error creando pago en efectivo:', error);
    throw new Error('Error al crear el pago en efectivo');
  }
}

// Obtener métodos de pago disponibles
async function getPaymentMethods() {
  const methods = await query(
    `SELECT * FROM payment_methods WHERE is_active = TRUE ORDER BY name`
  );
  
  return methods;
}

// Reembolsar pago
async function refundPayment(paymentId, amount = null) {
  try {
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    if (payment.mercadopago_payment_id) {
      // Configurar Mercado Pago
      if (!configureMercadoPago()) {
        throw new Error('Mercado Pago no está configurado. Contacta al administrador.');
      }

      // Reembolso en Mercado Pago
      const refund = await mercadopago.refund.create({
        payment_id: payment.mercadopago_payment_id,
        amount: amount || payment.amount
      });

      // Actualizar estado en base de datos
      await query(
        `UPDATE payments 
         SET status = 'refunded', 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [paymentId]
      );

      return refund.body;
    } else {
      // Reembolso manual para pagos en efectivo
      await query(
        `UPDATE payments 
         SET status = 'refunded', 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [paymentId]
      );

      return { success: true, message: 'Reembolso procesado manualmente' };
    }

  } catch (error) {
    console.error('Error procesando reembolso:', error);
    throw new Error('Error al procesar el reembolso');
  }
}

module.exports = {
  createPaymentPreference,
  processWebhook,
  getPaymentById,
  getPaymentByAppointmentId,
  getUserPayments,
  getAllPayments,
  getPaymentStats,
  checkPaymentStatus,
  createCashPayment,
  getPaymentMethods,
  refundPayment
}; 