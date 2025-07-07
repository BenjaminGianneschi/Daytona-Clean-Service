const moment = require('moment');
const { query, beginTransaction, commitTransaction, rollbackTransaction } = require('../config/database');
const whatsappService = require('../services/whatsappService');

// Obtener disponibilidad de horarios para una fecha específica
const getAvailability = async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Fecha requerida'
      });
    }

    // Validar formato de fecha
    const requestedDate = moment(date, 'YYYY-MM-DD', true);
    if (!requestedDate.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Verificar que la fecha no sea en el pasado
    if (requestedDate.isBefore(moment(), 'day')) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden reservar turnos en fechas pasadas'
      });
    }

    const dayOfWeek = requestedDate.day(); // 0=Domingo, 1=Lunes, etc.

    // Obtener horario de trabajo para ese día
    const workSchedule = await query(
      'SELECT * FROM work_schedules WHERE day_of_week = ? AND is_working_day = 1',
      [dayOfWeek]
    );

    if (workSchedule.length === 0) {
      return res.json({
        success: true,
        data: {
          date: date,
          isWorkingDay: false,
          availableSlots: []
        }
      });
    }

    // Verificar si el día está bloqueado
    const blockedDate = await query(
      'SELECT * FROM blocked_dates WHERE date = ?',
      [date]
    );

    if (blockedDate.length > 0) {
      return res.json({
        success: true,
        data: {
          date: date,
          isWorkingDay: false,
          isBlocked: true,
          reason: blockedDate[0].reason,
          availableSlots: []
        }
      });
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
      const existingAppointments = await query(
        'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND start_time = ? AND status IN ("pending", "confirmed")',
        [date, slotStart.format('HH:mm:ss')]
      );

      if (existingAppointments[0].count === 0) {
        availableSlots.push({
          startTime: slotStart.format('HH:mm'),
          endTime: slotEnd.format('HH:mm'),
          available: true
        });
      } else {
        availableSlots.push({
          startTime: slotStart.format('HH:mm'),
          endTime: slotEnd.format('HH:mm'),
          available: false
        });
      }
    }

    res.json({
      success: true,
      data: {
        date: date,
        isWorkingDay: true,
        workStart: schedule.start_time,
        workEnd: schedule.end_time,
        slotDuration: slotDuration,
        availableSlots: availableSlots
      }
    });

  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo turno
const createAppointment = async (req, res) => {
  const connection = await beginTransaction();
  
  try {
    const {
      clientName,
      clientPhone,
      clientEmail,
      appointmentDate,
      startTime,
      services,
      totalAmount,
      notes,
      serviceLocation
    } = req.body;

    // Validaciones básicas
    if (!clientName || !clientPhone || !appointmentDate || !startTime || !services || !totalAmount) {
      await rollbackTransaction(connection);
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben estar presentes'
      });
    }

    // Verificar disponibilidad del horario
    const existingAppointments = await query(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND start_time = ? AND status IN ("pending", "confirmed")',
      [appointmentDate, startTime]
    );

    if (existingAppointments[0].count > 0) {
      await rollbackTransaction(connection);
      return res.status(409).json({
        success: false,
        message: 'El horario seleccionado no está disponible'
      });
    }

    // Crear o buscar cliente
    let clientId;
    const existingClient = await query(
      'SELECT id FROM clients WHERE phone = ?',
      [clientPhone]
    );

    if (existingClient.length > 0) {
      clientId = existingClient[0].id;
      // Actualizar información del cliente si es necesario
      await query(
        'UPDATE clients SET name = ?, email = ? WHERE id = ?',
        [clientName, clientEmail || null, clientId]
      );
    } else {
      const clientResult = await query(
        'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
        [clientName, clientPhone, clientEmail || null]
      );
      clientId = clientResult.insertId;
    }

    // Calcular hora de fin basada en la duración total de los servicios
    const totalDuration = services.reduce((total, service) => {
      return total + (service.duration || 120) * service.quantity;
    }, 0);

    const startMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endMoment = startMoment.clone().add(totalDuration, 'minutes');
    const endTime = endMoment.format('HH:mm:ss');

    // Crear el turno - incluir user_id si el usuario está autenticado
    const userId = req.user ? req.user.id : null;
    const appointmentResult = await query(
      'INSERT INTO appointments (client_id, user_id, appointment_date, start_time, end_time, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")',
      [clientId, userId, appointmentDate, startTime, endTime, totalAmount, notes || null]
    );

    const appointmentId = appointmentResult.insertId;

    // Agregar servicios al turno
    for (const service of services) {
      await query(
        'INSERT INTO appointment_services (appointment_id, service_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [appointmentId, service.id, service.quantity, service.price, service.totalPrice]
      );
    }

    // Agregar ubicación del servicio si se proporciona
    if (serviceLocation) {
      await query(
        'INSERT INTO service_locations (appointment_id, address, city, postal_code, notes) VALUES (?, ?, ?, ?, ?)',
        [appointmentId, serviceLocation.address, serviceLocation.city, serviceLocation.postalCode || null, serviceLocation.notes || null]
      );
    }

    await commitTransaction(connection);

    // Comentado: Envío automático de WhatsApp deshabilitado
    // Los turnos se guardan en el historial sin enviar notificaciones automáticas
    /*
    try {
      const appointmentData = {
        id: appointmentId,
        client_name: clientName,
        client_phone: clientPhone,
        appointment_date: appointmentDate,
        start_time: startTime,
        total_amount: totalAmount,
        address: serviceLocation?.address,
        services: services.map(service => ({
          service_name: service.name || `Servicio ${service.id}`,
          quantity: service.quantity,
          price: service.price,
          total_price: service.totalPrice
        }))
      };

      await whatsappService.sendConfirmation(appointmentData);
    } catch (whatsappError) {
      console.error('Error enviando notificación WhatsApp:', whatsappError);
      // No fallar el turno si falla la notificación
    }
    */

    // Obtener el turno creado con toda la información
    const appointment = await query(`
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        sl.address,
        sl.city,
        sl.postal_code,
        sl.notes as location_notes
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN service_locations sl ON a.id = sl.appointment_id
      WHERE a.id = ?
    `, [appointmentId]);

    // Obtener servicios del turno
    const appointmentServices = await query(`
      SELECT 
        as.*,
        s.name as service_name,
        s.category as service_category
      FROM appointment_services as
      LEFT JOIN services s ON as.service_id = s.id
      WHERE as.appointment_id = ?
    `, [appointmentId]);

    res.status(201).json({
      success: true,
      message: 'Turno creado exitosamente',
      data: {
        appointment: appointment[0],
        services: appointmentServices
      }
    });

  } catch (error) {
    await rollbackTransaction(connection);
    console.error('Error creando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los turnos (para admin)
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      date, 
      clientName,
      startDate,
      endDate 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Filtros
    if (status) {
      whereConditions.push('a.status = ?');
      queryParams.push(status);
    }

    if (date) {
      whereConditions.push('a.appointment_date = ?');
      queryParams.push(date);
    }

    if (startDate && endDate) {
      whereConditions.push('a.appointment_date BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    }

    if (clientName) {
      whereConditions.push('c.name LIKE ?');
      queryParams.push(`%${clientName}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Consulta principal
    const appointments = await query(`
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        sl.address,
        sl.city
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN service_locations sl ON a.id = sl.appointment_id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Contar total de registros
    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      ${whereClause}
    `, queryParams);

    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un turno específico
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await query(`
      SELECT 
        a.*,
        c.name as client_name,
        c.phone as client_phone,
        c.email as client_email,
        sl.address,
        sl.city,
        sl.postal_code,
        sl.notes as location_notes
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN service_locations sl ON a.id = sl.appointment_id
      WHERE a.id = ?
    `, [id]);

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Obtener servicios del turno
    const services = await query(`
      SELECT 
        as.*,
        s.name as service_name,
        s.category as service_category
      FROM appointment_services as
      LEFT JOIN services s ON as.service_id = s.id
      WHERE as.appointment_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        appointment: appointment[0],
        services
      }
    });

  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado del turno
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado válido requerido'
      });
    }

    const result = await query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Comentado: Envío automático de WhatsApp deshabilitado
    // Los cambios de estado se guardan en el historial sin enviar notificaciones automáticas
    /*
    try {
      const appointment = await query(`
        SELECT 
          a.*,
          c.name as client_name,
          c.phone as client_phone,
          sl.address
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN service_locations sl ON a.id = sl.appointment_id
        WHERE a.id = ?
      `, [id]);

      if (appointment.length > 0) {
        const appointmentData = appointment[0];
        
        if (status === 'confirmed') {
          await whatsappService.sendConfirmation(appointmentData);
        } else if (status === 'cancelled') {
          await whatsappService.sendCancellation(appointmentData, 'Cancelado por administrador');
        }
      }
    } catch (whatsappError) {
      console.error('Error enviando notificación WhatsApp:', whatsappError);
      // No fallar la actualización si falla la notificación
    }
    */

    res.json({
      success: true,
      message: 'Estado del turno actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado del turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cancelar turno
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(
      'UPDATE appointments SET status = "cancelled", notes = CONCAT(IFNULL(notes, ""), " | Cancelado: ", ?) WHERE id = ?',
      [reason || 'Sin motivo especificado', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Comentado: Envío automático de WhatsApp deshabilitado
    // Las cancelaciones se guardan en el historial sin enviar notificaciones automáticas
    /*
    try {
      const appointment = await query(`
        SELECT 
          a.*,
          c.name as client_name,
          c.phone as client_phone,
          sl.address
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN service_locations sl ON a.id = sl.appointment_id
        WHERE a.id = ?
      `, [id]);

      if (appointment.length > 0) {
        await whatsappService.sendCancellation(appointment[0], reason || 'Sin motivo especificado');
      }
    } catch (whatsappError) {
      console.error('Error enviando notificación WhatsApp:', whatsappError);
      // No fallar la cancelación si falla la notificación
    }
    */

    res.json({
      success: true,
      message: 'Turno cancelado exitosamente'
    });

  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
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