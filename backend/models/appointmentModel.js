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
async function createAppointment(appointmentData) {
  const { appointmentDate, startTime, totalAmount, serviceLocation, userId, clientName, clientPhone, clientEmail } = appointmentData;
  
  const result = await query(
    `INSERT INTO appointments (appointment_date, start_time, total_price, service_location, user_id, client_name, client_phone, client_email, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP)
     RETURNING id`,
    [appointmentDate, startTime, totalAmount, serviceLocation, userId, clientName, clientPhone, clientEmail]
  );
  
  return result[0].id;
}

// Insertar servicios en appointment_services
async function addAppointmentServices(appointmentId, services) {
  console.log('addAppointmentServices llamado con:', { appointmentId, services });
  let totalCalculado = 0;
  
  for (const s of services) {
    // Obtener precio real desde la base de datos
    const serviceResult = await query('SELECT price FROM services WHERE id = $1', [s.service_id]);
    if (serviceResult.length === 0) {
      throw new Error(`Servicio con ID ${s.service_id} no encontrado`);
    }
    
    const precioReal = serviceResult[0].price;
    const subtotal = precioReal * s.quantity;
    totalCalculado += subtotal;
    
    console.log('Insertando en appointment_services:', { 
      appointmentId, 
      service_id: s.service_id, 
      quantity: s.quantity,
      price: precioReal,
      subtotal: subtotal
    });
    
    await query(
      `INSERT INTO appointment_services (appointment_id, service_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [appointmentId, s.service_id, s.quantity, precioReal]
    );
  }
  
  // Actualizar el total del turno con el precio real calculado
  await query('UPDATE appointments SET total_price = $1 WHERE id = $2', [totalCalculado, appointmentId]);
  
  console.log('Total calculado desde BD:', totalCalculado);
  return totalCalculado;
}

// Eliminar turno y sus servicios asociados
async function deleteAppointment(appointmentId) {
  // Primero eliminar servicios asociados
  await query('DELETE FROM appointment_services WHERE appointment_id = $1', [appointmentId]);
  // Luego eliminar el turno
  await query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
}

// Obtener todos los turnos (admin)
async function getAllAppointments() {
  const appointments = await query(`
    SELECT 
      a.*,
      a.service_location as serviceLocation,
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
      a.service_location as serviceLocation,
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
      a.service_location as serviceLocation,
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
  const { appointment_date, appointment_time, notes, service_location } = updateData;
  
  await query(`
    UPDATE appointments 
    SET appointment_date = $1, appointment_time = $2, notes = $3, service_location = $4, updated_at = NOW()
    WHERE id = $5
  `, [appointment_date, appointment_time, notes || null, service_location || null, id]);
}

// Obtener todos los servicios con precios
async function getAllServices() {
  const services = await query(`
    SELECT id, name, price, duration, description
    FROM services 
    ORDER BY name
  `);
  return services;
}

module.exports = {
  getAvailabilityByDate,
  countAppointments,
  createAppointment,
  addAppointmentServices,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getUserAppointments,
  updateUserAppointment,
  getAllServices
};