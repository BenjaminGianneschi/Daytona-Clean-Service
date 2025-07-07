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
    const { clientName, clientPhone, clientEmail, appointmentDate, startTime, services, totalAmount, notes, serviceLocation } = req.body;
    if (!clientName || !clientPhone || !appointmentDate || !startTime || !services || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Todos los campos requeridos deben estar presentes' });
    }
    // Verificar disponibilidad del horario
    const count = await appointmentModel.countAppointments(appointmentDate, startTime);
    if (count > 0) {
      return res.status(409).json({ success: false, message: 'El horario seleccionado no está disponible' });
    }
    // Crear o buscar cliente
    let clientId;
    const existingClient = await appointmentModel.findClientByPhone(clientPhone);
    if (existingClient.length > 0) {
      clientId = existingClient[0].id;
      await appointmentModel.updateClient(clientName, clientEmail, clientId);
    } else {
      clientId = await appointmentModel.createClient(clientName, clientPhone, clientEmail);
    }
    // Calcular hora de fin basada en la duración total de los servicios
    const totalDuration = services.reduce((total, service) => total + (service.duration || 120) * service.quantity, 0);
    const startMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endMoment = startMoment.clone().add(totalDuration, 'minutes');
    const endTime = endMoment.format('HH:mm:ss');
    // Crear el turno
    const userId = req.user ? req.user.id : null;
    const appointmentId = await appointmentModel.createAppointment({ clientId, appointmentDate, startTime, endTime, services, totalAmount, notes, serviceLocation, userId });
    // (Opcional) Enviar WhatsApp de confirmación
    // await whatsappService.sendConfirmation(clientPhone, appointmentDate, startTime);
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

// Actualizar estado de un turno
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await appointmentModel.updateAppointmentStatus(id, status);
    res.json({ success: true, message: 'Estado del turno actualizado' });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Cancelar turno
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await appointmentModel.cancelAppointment(id);
    res.json({ success: true, message: 'Turno cancelado' });
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAvailability,
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment
}; 