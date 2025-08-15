const moment = require('moment');
const appointmentModel = require('../models/appointmentModel');
const whatsappService = require('../services/whatsappService');
const notificationService = require('../services/notificationService');

// Obtener disponibilidad de horarios para una fecha específica
const getAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    const { duration = 120 } = req.query;
    
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
    
    // Obtener turnos existentes para esa fecha
    const existingAppointments = await appointmentModel.getAppointmentsByDate(date);
    
    // Generar horarios disponibles (8:00 a 18:00)
    const availableHours = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour += 2) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      
      // Verificar si hay turnos que se superponen
      let isAvailable = true;
      
      for (const appointment of existingAppointments) {
        const appStart = appointment.appointment_time;
        const appEnd = moment(appStart, 'HH:mm:ss').add(appointment.duration || 120, 'minutes').format('HH:mm:ss');
        
        // Si hay superposición, marcar como no disponible
        if (slotStart < appEnd && moment(slotStart, 'HH:mm').add(2, 'hours').format('HH:mm:ss') > appStart) {
          isAvailable = false;
          break;
        }
      }
      
      // Solo agregar horarios disponibles
      if (isAvailable) {
        availableHours.push(slotStart);
      }
    }
    
    res.json({ 
      success: true, 
      availableHours,
      message: `Horarios disponibles para ${date}`
    });
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Crear nuevo turno
const createAppointment = async (req, res) => {
  try {
    console.log('📋 Datos recibidos para crear turno:', req.body);
    
    const { appointmentDate, appointmentTime, services, serviceLocation, userId, clientName, clientPhone, clientEmail, service_type, totalAmount } = req.body;
    
    // Validaciones básicas
    if (!appointmentDate || !appointmentTime || !services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para crear el turno.' });
    }

    // Validar y procesar service_type
    if (!service_type) {
      console.error('❌ Error: service_type es null o undefined');
      return res.status(400).json({ success: false, message: 'El campo service_type es obligatorio.' });
    }

    // Validar dirección obligatoria
    if (!serviceLocation || typeof serviceLocation !== 'string' || serviceLocation.trim() === '' || serviceLocation === 'A confirmar') {
      return res.status(400).json({ success: false, message: 'El campo dirección (serviceLocation) es obligatorio.' });
    }

    // Validar datos del cliente
    if (!clientName || !clientPhone) {
      return res.status(400).json({ success: false, message: 'Nombre y teléfono del cliente son obligatorios.' });
    }

    // Validar y convertir totalAmount a número
    let precioFinal = 0;
    if (totalAmount !== undefined && totalAmount !== null) {
      precioFinal = Number(totalAmount);
      if (isNaN(precioFinal)) {
        console.error('❌ Error: totalAmount no es un número válido:', totalAmount);
        return res.status(400).json({ success: false, message: 'El campo totalAmount debe ser un número válido.' });
      }
    }

    console.log('✅ Datos procesados:', {
      appointmentDate,
      appointmentTime,
      service_type,
      precioFinal,
      servicesCount: services.length,
      clientName,
      clientPhone
    });

    // Llamar al modelo para crear el turno (incluye validación de disponibilidad)
    const appointmentId = await appointmentModel.createAppointment({
      appointmentDate,
      appointmentTime,
      userId: userId || null, // Puede ser null si no hay usuario autenticado
      clientName,
      clientPhone,
      clientEmail: clientEmail || '',
      serviceLocation,
      services,
      service_type,
      totalAmount: precioFinal
    });

    // Registrar evento de analytics si está disponible el helper
    if (req.trackEvent) {
      await req.trackEvent('appointment_create', {
        appointmentId,
        service_type,
        totalAmount: precioFinal,
        services: services.map(s => s.name).join(', '),
        isAuthenticated: !!userId
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Turno creado exitosamente',
      appointmentId 
    });
  } catch (error) {
    console.error('Error creando turno:', error);
    let msg = 'Error interno del servidor';
    if (error.message && (error.message.includes('no encontrado') || error.message.includes('No se puede reservar') || error.message.includes('no está disponible'))) {
      msg = error.message;
    }
    res.status(500).json({ success: false, message: msg });
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
    
    // Guardar estado anterior para notificaciones
    const previousStatus = appointment.status;
    
    // Actualizar estado
    await appointmentModel.updateAppointmentStatus(id, status);
    
    // Enviar notificaciones según el cambio de estado
    let notificationResult = null;
    
    if (status === 'confirmed' && previousStatus === 'pending') {
      // Notificación de confirmación
      notificationResult = await notificationService.sendConfirmationNotification(appointment);
      console.log('📱 Notificación de confirmación enviada:', notificationResult);
    } else if (status === 'completed' && previousStatus !== 'completed') {
      // Notificación de completado (opcional)
      console.log('✅ Turno marcado como completado');
    }
    
    res.json({ 
      success: true, 
      message: 'Estado del turno actualizado exitosamente',
      notification: notificationResult
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Cancelar turno (admin)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Motivo de cancelación opcional
    
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
    
    // Enviar notificación de cancelación
    const notificationResult = await notificationService.sendCancellationNotification(
      appointment, 
      reason || 'Cancelado por el administrador'
    );
    console.log('📱 Notificación de cancelación enviada:', notificationResult);
    
    res.json({ 
      success: true, 
      message: 'Turno cancelado exitosamente',
      notification: notificationResult
    });
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
    const { appointment_date, appointment_time, notes, service_location } = req.body;
    
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
    if (appointment_date !== appointment.appointment_date || appointment_time !== appointment.appointment_time) {
      const count = await appointmentModel.countAppointments(appointment_date, appointment_time, id);
      if (count > 0) {
        return res.status(409).json({ success: false, message: 'El nuevo horario no está disponible' });
      }
    }
    
    // Actualizar el turno
    await appointmentModel.updateUserAppointment(id, {
      appointment_date,
      appointment_time,
      notes,
      service_location
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

// Obtener todos los servicios
const getAllServices = async (req, res) => {
  try {
    const services = await appointmentModel.getAllServices();
    
    res.json({ 
      success: true, 
      services,
      message: 'Servicios obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Enviar recordatorio manual (admin)
const sendManualReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el turno existe
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
    
    // Verificar que el turno esté confirmado
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Solo se pueden enviar recordatorios a turnos confirmados' });
    }
    
    // Enviar recordatorio
    const notificationResult = await notificationService.sendReminderNotification(appointment);
    console.log('📱 Recordatorio manual enviado:', notificationResult);
    
    res.json({ 
      success: true, 
      message: 'Recordatorio enviado exitosamente',
      notification: notificationResult
    });
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
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
  cancelUserAppointment,
  getAllServices,
  sendManualReminder
}; 