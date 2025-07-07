// Modelo de Turnos (Appointments)
const { query, beginTransaction, commitTransaction, rollbackTransaction } = require('../config/database');
const moment = require('moment');

// Obtener disponibilidad de horarios para una fecha específica
async function getAvailabilityByDate(date) {
  const requestedDate = moment(date, 'YYYY-MM-DD', true);
  const dayOfWeek = requestedDate.day();
  const workSchedule = await query(
    'SELECT * FROM work_schedules WHERE day_of_week = ? AND is_working_day = 1',
    [dayOfWeek]
  );
  const blockedDate = await query(
    'SELECT * FROM blocked_dates WHERE date = ?',
    [date]
  );
  return { workSchedule, blockedDate };
}

// Verificar si hay turnos existentes en un horario
async function countAppointments(date, startTime) {
  const existingAppointments = await query(
    'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND start_time = ? AND status IN ("pending", "confirmed")',
    [date, startTime]
  );
  return existingAppointments[0].count;
}

// Buscar cliente por teléfono
async function findClientByPhone(phone) {
  const existingClient = await query(
    'SELECT id FROM clients WHERE phone = ?',
    [phone]
  );
  return existingClient;
}

// Crear cliente
async function createClient(name, phone, email) {
  const clientResult = await query(
    'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
    [name, phone, email || null]
  );
  return clientResult.insertId;
}

// Actualizar cliente
async function updateClient(name, email, clientId) {
  await query(
    'UPDATE clients SET name = ?, email = ? WHERE id = ?',
    [name, email || null, clientId]
  );
}

// Crear turno
async function createAppointment({ clientId, appointmentDate, startTime, endTime, services, totalAmount, notes, serviceLocation, userId }) {
  const appointmentResult = await query(
    'INSERT INTO appointments (client_id, appointment_date, start_time, end_time, total_amount, notes, service_location, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [clientId, appointmentDate, startTime, endTime, totalAmount, notes || null, serviceLocation || null, userId, 'pending']
  );
  const appointmentId = appointmentResult.insertId;
  // Insertar servicios asociados al turno
  for (const service of services) {
    await query(
      'INSERT INTO appointment_services (appointment_id, service_id, quantity, duration, price) VALUES (?, ?, ?, ?, ?)',
      [appointmentId, service.id, service.quantity, service.duration, service.price]
    );
  }
  return appointmentId;
}

// Obtener todos los turnos (admin)
async function getAllAppointments() {
  return await query('SELECT * FROM appointments');
}

// Obtener un turno por ID
async function getAppointmentById(id) {
  const appointments = await query('SELECT * FROM appointments WHERE id = ?', [id]);
  return appointments[0];
}

// Actualizar estado de un turno
async function updateAppointmentStatus(id, status) {
  await query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}

// Cancelar turno
async function cancelAppointment(id) {
  await query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
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
  cancelAppointment
}; 