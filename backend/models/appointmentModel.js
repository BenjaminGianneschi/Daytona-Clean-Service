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
async function countAppointments(date, startTime, excludeId = null) {
  let sql = 'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = $1 AND start_time = $2 AND status IN ($3, $4)';
  let params = [date, startTime, 'pending', 'confirmed'];
  
  if (excludeId) {
    sql += ' AND id != $5';
    params.push(excludeId);
  }
  
  const existingAppointments = await query(sql, params);
  return parseInt(existingAppointments[0].count);
}

// Buscar cliente por teléfono
async function findClientByPhone(phone) {
  const existingClient = await query(
    'SELECT id FROM clients WHERE phone = $1',
    [phone]
  );
  return existingClient;
}

// Crear cliente
async function createClient(name, phone, email) {
  const clientResult = await query(
    'INSERT INTO clients (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
    [name, phone, email || null]
  );
  return clientResult[0].id;
}

// Actualizar cliente
async function updateClient(name, email, clientId) {
  await query(
    'UPDATE clients SET name = $1, email = $2 WHERE id = $3',
    [name, email || null, clientId]
  );
}

// Crear turno
async function createAppointment({ clientId, appointmentDate, startTime, endTime, services, totalAmount, notes, serviceLocation, userId }) {
  const appointmentResult = await query(
    'INSERT INTO appointments (client_id, appointment_date, start_time, end_time, total_amount, notes, service_location, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
    [clientId, appointmentDate, startTime, endTime, totalAmount, notes || null, serviceLocation || null, userId, 'pending']
  );
  const appointmentId = appointmentResult[0].id;
  
  // Insertar servicios asociados al turno
  for (const service of services) {
    let serviceId;
    
    // Si el servicio tiene un id, usarlo directamente
    if (service.id) {
      serviceId = service.id;
    } else if (service.name) {
      // Buscar el servicio por nombre
      const existingService = await query(
        'SELECT id FROM services WHERE name = $1',
        [service.name]
      );
      
      if (existingService.length > 0) {
        serviceId = existingService[0].id;
      } else {
        // Crear un nuevo servicio si no existe
        const newService = await query(
          'INSERT INTO services (name, price, duration) VALUES ($1, $2, $3) RETURNING id',
          [service.name, service.price || 0, service.duration || 120]
        );
        serviceId = newService[0].id;
      }
    }
    
    if (serviceId) {
      await query(
        'INSERT INTO appointment_services (appointment_id, service_id, quantity, duration, price) VALUES ($1, $2, $3, $4, $5)',
        [appointmentId, serviceId, service.quantity || 1, service.duration || 120, service.price || 0]
      );
    }
  }
  return appointmentId;
}

// Obtener todos los turnos (admin)
async function getAllAppointments() {
  const appointments = await query(`
    SELECT 
      a.*,
      c.name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      u.name as user_name,
      u.email as user_email
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `);
  
  // Para cada turno, obtener los servicios asociados
  for (let appointment of appointments) {
    const services = await query(`
      SELECT 
        s.name as service_name,
        s.price,
        s.duration,
        aps.quantity,
        aps.price as service_price
      FROM appointment_services aps
      JOIN services s ON aps.service_id = s.id
      WHERE aps.appointment_id = $1
    `, [appointment.id]);
    
    appointment.services = services;
  }
  
  return appointments;
}

// Obtener un turno por ID
async function getAppointmentById(id) {
  const appointments = await query(`
    SELECT 
      a.*,
      c.name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      u.name as user_name,
      u.email as user_email
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = $1
  `, [id]);
  
  if (appointments.length === 0) {
    return null;
  }
  
  const appointment = appointments[0];
  
  // Obtener servicios asociados
  const services = await query(`
    SELECT 
      s.name as service_name,
      s.price,
      s.duration,
      aps.quantity,
      aps.price as service_price
    FROM appointment_services aps
    JOIN services s ON aps.service_id = s.id
    WHERE aps.appointment_id = $1
  `, [id]);
  
  appointment.services = services;
  
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
      c.name as client_name,
      c.phone as client_phone,
      c.email as client_email
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    WHERE a.user_id = $1
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `, [userId]);
  
  // Para cada turno, obtener los servicios asociados
  for (let appointment of appointments) {
    const services = await query(`
      SELECT 
        s.name as service_name,
        s.price,
        s.duration,
        aps.quantity,
        aps.price as service_price
      FROM appointment_services aps
      JOIN services s ON aps.service_id = s.id
      WHERE aps.appointment_id = $1
    `, [appointment.id]);
    
    appointment.services = services;
  }
  
  return appointments;
}

// Actualizar turno del usuario
async function updateUserAppointment(id, updateData) {
  const { appointment_date, start_time, service_location, notes } = updateData;
  
  await query(`
    UPDATE appointments 
    SET appointment_date = $1, start_time = $2, service_location = $3, notes = $4, updated_at = NOW()
    WHERE id = $5
  `, [appointment_date, start_time, service_location || null, notes || null, id]);
}

module.exports = {
  getAvailabilityByDate,
  countAppointments,
  findClientByPhone,
  createClient,
  updateClient,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getUserAppointments,
  updateUserAppointment
};