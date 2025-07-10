const moment = require('moment');
const appointmentModel = require('../models/appointmentModel');
const whatsappService = require('../services/whatsappService');

// Obtener disponibilidad de horarios para una fecha específica
const getAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Fecha requerida' });
    }
    // Validar formato de fecha
    const requestedDate = moment(date, 'YYYY-MM-DD', true);
    if (!requestedDate.isValid()) {
      return res.status(400).json({ success: false, message: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }
    // Verificar que la fecha no sea en el pasado
    if (requestedDate.isBefore(moment(), 'day')) {
      return res.status(400).json({ success: false, message: 'No se pueden reservar turnos en fechas pasadas' });
    }
    // Consultar disponibilidad usando el modelo
    const { workSchedule, blockedDate } = await appointmentModel.getAvailabilityByDate(date);
    if (workSchedule.length === 0) {
      return res.json({ success: true, data: { date, isWorkingDay: false, availableSlots: [] } });
    }
    if (blockedDate.length > 0) {
      return res.json({ success: true, data: { date, isWorkingDay: false, isBlocked: true, reason: blockedDate[0].reason, availableSlots: [] } });
    }
    const schedule = workSchedule[0];
    const startTime = moment(schedule.start_time, 'HH:mm:ss');
    const endTime = moment(schedule.end_time, 'HH:mm:ss');
    const slotDuration = parseInt(process.env.TURN_DURATION) || 120; // minutos
    // Generar slots de tiempo disponibles
    const availableSlots = [];
    let currentTime = startTime.clone();
    while (currentTime.add(slotDuration, 'minutes').isBefore(endTime) || currentTime.isSame(endTime)) {
      const slotStart = currentTime.clone().subtract(slotDuration, 'minutes');
      const slotEnd = currentTime.clone();
      // Verificar si hay turnos existentes en este horario
      const count = await appointmentModel.countAppointments(date, slotStart.format('HH:mm:ss'));
      availableSlots.push({
        startTime: slotStart.format('HH:mm'),
        endTime: slotEnd.format('HH:mm'),
        available: count === 0
      });
    }
    res.json({ success: true, data: { date, isWorkingDay: true, workStart: schedule.start_time, workEnd: schedule.end_time, slotDuration, availableSlots } });
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Crear nuevo turno
const createAppointment = async (req, res) => {
  try {
    const { appointmentDate, startTime, services, totalAmount, notes, serviceLocation, userId } = req.body;
    if (!appointmentDate || !startTime || !services || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Todos los campos requeridos deben estar presentes' });
    }
    // Verificar disponibilidad del horario
    const count = await appointmentModel.countAppointments(appointmentDate, startTime);
    if (count > 0) {
      return res.status(409).json({ success: false, message: 'El horario seleccionado no está disponible' });
    }
    // Crear el turno
    const appointmentId = await appointmentModel.createAppointment({ 
      appointmentDate, 
      appointmentTime: startTime, 
      services, 
      totalAmount, 
      notes: notes || `Ubicación: ${serviceLocation || 'A confirmar'}`, 
      userId: userId || null 
    });
    res.json({ success: true, message: 'Turno creado exitosamente', appointmentId });
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener todos los turnos (admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.getAllAppointments();
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener un turno por ID
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Actualizar estado de un turno (admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar estado
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado inválido. Estados válidos: pending, confirmed, completed, cancelled' 
      });
    }
    
    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    // Actualizar estado
    await appointmentModel.updateAppointmentStatus(id, status);
    
    res.json({ success: true, message: 'Estado del turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Cancelar turno (admin)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    // Verificar que el turno no esté ya cancelado
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Este turno ya está cancelado' });
    }
    
    // Verificar que el turno no esté completado
    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'No se puede cancelar un turno completado' });
    }
    
    // Cancelar el turno
    await appointmentModel.cancelAppointment(id);
    
    res.json({ success: true, message: 'Turno cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener turnos del usuario logueado
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel.getUserAppointments(userId);
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error obteniendo turnos del usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Editar turno del usuario logueado
const updateUserAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { appointment_date, start_time, notes } = req.body;
    
    // Verificar que el turno pertenece al usuario
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    if (appointment.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar este turno' });
    }
    
    // Verificar que el turno no esté cancelado o completado
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'No se puede editar un turno cancelado o completado' });
    }
    
    // Verificar disponibilidad del nuevo horario si cambió
    if (appointment_date !== appointment.appointment_date || start_time !== appointment.appointment_time) {
      const count = await appointmentModel.countAppointments(appointment_date, start_time, id);
      if (count > 0) {
        return res.status(409).json({ success: false, message: 'El nuevo horario no está disponible' });
      }
    }
    
    // Actualizar el turno
    await appointmentModel.updateUserAppointment(id, {
      appointment_date,
      appointment_time: start_time,
      notes
    });
    
    res.json({ success: true, message: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando turno del usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Cancelar turno del usuario logueado
const cancelUserAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el turno pertenece al usuario
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    if (appointment.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para cancelar este turno' });
    }
    
    // Verificar que el turno no esté cancelado o completado
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Este turno ya está cancelado' });
    }
    
    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'No se puede cancelar un turno completado' });
    }
    
    // Cancelar el turno
    await appointmentModel.cancelAppointment(id);
    
    res.json({ success: true, message: 'Turno cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelando turno del usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Marcar turno como completado (admin)
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    // Verificar que el turno no esté ya completado
    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Este turno ya está completado' });
    }
    
    // Verificar que el turno no esté cancelado
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'No se puede completar un turno cancelado' });
    }
    
    // Marcar como completado
    await appointmentModel.updateAppointmentStatus(id, 'completed');
    
    res.json({ success: true, message: 'Turno marcado como completado exitosamente' });
  } catch (error) {
    console.error('Error completando turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAvailability,
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  completeAppointment,
  getUserAppointments,
  updateUserAppointment,
  cancelUserAppointment
}; 