// Modelo de Turnos (Appointments)
const { query, beginTransaction, commitTransaction, rollbackTransaction } = require('../config/database');
const moment = require('moment');

// Obtener disponibilidad de horarios para una fecha específica
async function getAvailabilityByDate(date) {
  const requestedDate = moment(date, 'YYYY-MM-DD', true);
  const dayOfWeek = requestedDate.day();
  const workSchedule = await query(
    'SELECT * FROM work_schedules WHERE day_of_week = $1 AND is_working_day = 1',
    [dayOfWeek]
  );
  const blockedDate = await query(
    'SELECT * FROM blocked_dates WHERE date = $1',
    [date]
  );
  return { workSchedule, blockedDate };
}

// Verificar si hay turnos existentes en un horario
async function countAppointments(date, appointmentTime, excludeId = null) {
  let sql = 'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = $1 AND appointment_time = $2 AND status IN ($3, $4)';
  let params = [date, appointmentTime, 'pending', 'confirmed'];
  
  if (excludeId) {
    sql += ' AND id != $5';
    params.push(excludeId);
  }
  
  const existingAppointments = await query(sql, params);
  return parseInt(existingAppointments[0].count);
}

// Crear turno
async function createAppointment({ clientId, appointmentDate, appointmentTime, services, totalAmount, notes, serviceLocation, userId }) {
  // Para la estructura actual, vamos a guardar el primer servicio como service_type
  // y los detalles en notes
  const serviceType = services && services.length > 0 ? services[0].name : 'Servicio General';
  const serviceDetails = services ? JSON.stringify(services) : null;
  
  const appointmentResult = await query(
    'INSERT INTO appointments (user_id, service_type, appointment_date, appointment_time, total_price, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [userId, serviceType, appointmentDate, appointmentTime, totalAmount, notes || serviceDetails, 'pending']
  );
  
  return appointmentResult[0].id;
}

// Obtener todos los turnos (admin)
async function getAllAppointments() {
  const appointments = await query(`
    SELECT 
      a.*,
      u.name as user_name,
      u.phone as user_phone,
      u.email as user_email
    FROM appointments a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);
  
  // Para cada turno, parsear los servicios desde notes si existen
  for (let appointment of appointments) {
    try {
      if (appointment.notes && appointment.notes.startsWith('[')) {
        appointment.services = JSON.parse(appointment.notes);
      } else {
        appointment.services = [{
          name: appointment.service_type,
          price: appointment.total_price,
          quantity: 1
        }];
      }
    } catch (error) {
      console.error('Error parseando servicios del turno:', error);
      appointment.services = [{
        name: appointment.service_type,
        price: appointment.total_price,
        quantity: 1
      }];
    }
  }
  
  return appointments;
}

// Obtener un turno por ID
async function getAppointmentById(id) {
  const appointments = await query(`
    SELECT 
      a.*,
      u.name as user_name,
      u.phone as user_phone,
      u.email as user_email
    FROM appointments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = $1
  `, [id]);
  
  if (appointments.length === 0) {
    return null;
  }
  
  const appointment = appointments[0];
  
  // Parsear servicios desde notes si existen
  try {
    if (appointment.notes && appointment.notes.startsWith('[')) {
      appointment.services = JSON.parse(appointment.notes);
    } else {
      appointment.services = [{
        name: appointment.service_type,
        price: appointment.total_price,
        quantity: 1
      }];
    }
  } catch (error) {
    console.error('Error parseando servicios del turno:', error);
    appointment.services = [{
      name: appointment.service_type,
      price: appointment.total_price,
      quantity: 1
    }];
  }
  
  return appointment;
}

// Actualizar estado de un turno
async function updateAppointmentStatus(id, status) {
  await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
}

// Cancelar turno
async function cancelAppointment(id) {
  await query('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', id]);
}

// Obtener turnos de un usuario específico
async function getUserAppointments(userId) {
  const appointments = await query(`
    SELECT 
      a.*,
      u.name as user_name,
      u.phone as user_phone,
      u.email as user_email
    FROM appointments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.user_id = $1
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `, [userId]);
  
  // Para cada turno, parsear los servicios desde notes si existen
  for (let appointment of appointments) {
    try {
      if (appointment.notes && appointment.notes.startsWith('[')) {
        appointment.services = JSON.parse(appointment.notes);
      } else {
        appointment.services = [{
          name: appointment.service_type,
          price: appointment.total_price,
          quantity: 1
        }];
      }
    } catch (error) {
      console.error('Error parseando servicios del turno:', error);
      appointment.services = [{
        name: appointment.service_type,
        price: appointment.total_price,
        quantity: 1
      }];
    }
  }
  
  return appointments;
}

// Actualizar turno del usuario
async function updateUserAppointment(id, updateData) {
  const { appointment_date, appointment_time, notes } = updateData;
  
  await query(`
    UPDATE appointments 
    SET appointment_date = $1, appointment_time = $2, notes = $3, updated_at = NOW()
    WHERE id = $4
  `, [appointment_date, appointment_time, notes || null, id]);
}

module.exports = {
  getAvailabilityByDate,
  countAppointments,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getUserAppointments,
  updateUserAppointment
};