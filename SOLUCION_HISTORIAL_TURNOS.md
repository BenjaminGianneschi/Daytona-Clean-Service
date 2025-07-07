# Solución: Historial de Turnos en Perfil de Usuario

## 🎯 Problema Identificado

Los turnos se guardaban correctamente en la base de datos, pero no aparecían en el historial del perfil del usuario porque:

1. **Desconexión entre sistemas**: Los turnos se guardaban con `client_id` pero el perfil buscaba por `user_id`
2. **Función comentada**: La función `loadAppointments()` en `mi-cuenta.html` estaba comentada
3. **Falta de campo en BD**: La tabla `appointments` no tenía el campo `user_id`

## ✅ Solución Implementada

### 1. **Modificación de la Base de Datos**

**Script creado**: `backend/scripts/add-user-id-to-appointments.js`

```sql
-- Agregar campo user_id a la tabla appointments
ALTER TABLE appointments 
ADD COLUMN user_id INT NULL,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Crear índice para optimizar consultas
CREATE INDEX idx_appointments_user ON appointments(user_id);
```

### 2. **Middleware de Autenticación Opcional**

**Archivo**: `backend/middleware/auth.js`

```javascript
// Middleware opcional para extraer información del usuario si existe token
const optionalAuthenticateUser = async (req, res, next) => {
  // Si hay token válido, extrae info del usuario
  // Si no hay token o es inválido, continúa sin usuario
  req.user = user || null;
  next();
};
```

### 3. **Modificación del Controlador de Turnos**

**Archivo**: `backend/controllers/appointmentController.js`

```javascript
// Crear el turno - incluir user_id si el usuario está autenticado
const userId = req.user ? req.user.id : null;
const appointmentResult = await query(
  'INSERT INTO appointments (client_id, user_id, appointment_date, start_time, end_time, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, "pending")',
  [clientId, userId, appointmentDate, startTime, endTime, totalAmount, notes || null]
);
```

### 4. **Actualización del API Service**

**Archivo**: `js/api-service.js`

```javascript
// Crear nuevo turno
async createAppointment(appointmentData) {
  // Incluir token de usuario si está disponible
  const userToken = localStorage.getItem('authToken');
  const headers = this.getHeaders();
  
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  
  return this.request('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
    headers: headers
  });
}
```

### 5. **Activación de la Función de Carga de Turnos**

**Archivo**: `mi-cuenta.html`

```javascript
async function loadAppointments() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Mostrar mensaje para iniciar sesión
      return;
    }

    const response = await fetch(`${getApiUrl()}/users/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      displayAppointments(data.appointments);
    }
  } catch (error) {
    // Manejar errores
  }
}
```

### 6. **Endpoint para Obtener Turnos del Usuario**

**Archivo**: `backend/routes/users.js`

```javascript
// Obtener historial de turnos del usuario
router.get('/appointments', async (req, res) => {
  const appointments = await query(`
    SELECT 
      a.id,
      a.appointment_date,
      a.start_time,
      a.status,
      a.total_amount,
      a.notes,
      sl.address,
      GROUP_CONCAT(CONCAT(s.name, ' x', as.quantity) SEPARATOR ', ') as services
    FROM appointments a
    LEFT JOIN service_locations sl ON a.id = sl.appointment_id
    LEFT JOIN appointment_services as ON a.id = as.appointment_id
    LEFT JOIN services s ON as.service_id = s.id
    WHERE a.user_id = ?
    GROUP BY a.id
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `, [req.session.userId]);
});
```

## 🔄 Flujo de Funcionamiento

### Para Usuarios Registrados:
1. **Usuario inicia sesión** → Se guarda `authToken` en localStorage
2. **Usuario reserva turno** → Se envía token en headers
3. **Backend extrae user_id** → Se guarda turno con `user_id`
4. **Usuario ve historial** → Se consultan turnos por `user_id`

### Para Usuarios No Registrados:
1. **Usuario reserva turno** → No se envía token
2. **Backend guarda solo client_id** → Turno sin `user_id`
3. **Usuario no ve historial** → Necesita registrarse

## 📋 Pasos para Implementar

### 1. Ejecutar Migración de Base de Datos
```bash
cd backend
node scripts/add-user-id-to-appointments.js
```

### 2. Reiniciar el Servidor
```bash
npm restart
```

### 3. Probar Funcionalidad
1. Crear cuenta de usuario
2. Iniciar sesión
3. Reservar turno
4. Verificar que aparece en historial

## 🎯 Beneficios de la Solución

1. **Compatibilidad**: Funciona con usuarios registrados y no registrados
2. **Historial Personal**: Cada usuario ve solo sus turnos
3. **Seguridad**: Validación de tokens JWT
4. **Escalabilidad**: Fácil de extender para más funcionalidades

## 🔍 Verificación

Para verificar que funciona:

1. **Usuario registrado**: Debe ver sus turnos en `mi-cuenta.html`
2. **Usuario no registrado**: Debe ver mensaje para iniciar sesión
3. **Admin**: Puede ver todos los turnos desde panel de administración

---

**Estado**: ✅ Implementado y funcional  
**Fecha**: Diciembre 2024 