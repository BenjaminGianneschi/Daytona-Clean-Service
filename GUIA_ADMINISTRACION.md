# 🚗 Guía de Administración - Daytona Clean Service

## 📋 Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Acceso al Panel de Administración](#acceso-al-panel-de-administración)
3. [Gestión de Turnos](#gestión-de-turnos)
4. [Configuración del Sistema](#configuración-del-sistema)
5. [Notificaciones WhatsApp](#notificaciones-whatsapp)
6. [Mantenimiento](#mantenimiento)

---

## 🔧 Configuración Inicial

### 1. Instalación del Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp config.env.example config.env
```

### 2. Configuración de la Base de Datos

Editar el archivo `backend/config.env`:

```env
# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=daytona_turnos
DB_PORT=3306

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Configuración WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER=5493482588383
```

### 3. Crear la Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de creación
source backend/database/schema.sql
```

### 4. Iniciar el Servidor

```bash
# En el directorio backend
npm start

# O en modo desarrollo
npm run dev
```

---

## 🔐 Acceso al Panel de Administración

### URL de Acceso
```
http://localhost:3000/admin/
```

### Credenciales por Defecto
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Cambiar Contraseña
1. Iniciar sesión en el panel
2. Hacer clic en el nombre de usuario (esquina superior derecha)
3. Seleccionar "Cambiar Contraseña"
4. Ingresar contraseña actual y nueva
5. Confirmar cambios

---

## 📅 Gestión de Turnos

### Vista General del Dashboard

El dashboard muestra:
- **Total de Turnos:** Número total de turnos en el sistema
- **Pendientes:** Turnos que requieren confirmación
- **Hoy:** Turnos programados para hoy
- **Ingresos:** Total de ingresos confirmados

### Filtros de Turnos

```javascript
// Filtros disponibles
- Todos: Muestra todos los turnos
- Pendientes: Solo turnos sin confirmar
- Confirmados: Turnos confirmados
- Cancelados: Turnos cancelados
```

### Búsqueda de Turnos

```javascript
// Criterios de búsqueda
- Nombre del cliente
- Número de teléfono
- ID del turno
- Fecha del turno
```

### Acciones por Turno

#### 1. Ver Detalles
- Hacer clic en el botón "Ver" de cualquier turno
- Se abre un modal con información completa:
  - Datos del cliente
  - Servicios contratados
  - Ubicación del servicio
  - Notas adicionales

#### 2. Confirmar Turno
```javascript
// Pasos para confirmar
1. Abrir detalles del turno
2. Hacer clic en "Confirmar"
3. El sistema enviará notificación WhatsApp automáticamente
4. El estado cambia a "Confirmado"
```

#### 3. Cancelar Turno
```javascript
// Pasos para cancelar
1. Abrir detalles del turno
2. Hacer clic en "Cancelar"
3. Ingresar motivo de cancelación
4. Se envía notificación al cliente
5. El estado cambia a "Cancelado"
```

### Exportar Turnos

```javascript
// Funcionalidad de exportación
- Formato: CSV
- Incluye: Todos los turnos filtrados
- Campos: ID, Cliente, Fecha, Hora, Servicios, Total, Estado
```

---

## ⚙️ Configuración del Sistema

### 1. Horarios de Trabajo

Acceder a: **Configuración → Horarios**

```javascript
// Configuraciones disponibles
- Hora de Inicio: 08:00
- Hora de Fin: 18:00
- Duración de Turnos: 60 minutos (configurable)
- Días de trabajo: Lunes a Sábado
```

### 2. Días Bloqueados

Acceder a: **Configuración → Bloqueos**

```javascript
// Agregar día bloqueado
1. Seleccionar fecha
2. Ingresar motivo (opcional)
3. Hacer clic en "Bloquear"
4. El día se marca como no disponible

// Ejemplos de uso
- Feriados nacionales
- Vacaciones
- Días de mantenimiento
- Eventos especiales
```

### 3. Notificaciones WhatsApp

Acceder a: **Configuración → Notificaciones**

```javascript
// Configuraciones
- Número de WhatsApp: +5493482588383
- Mensaje de Confirmación: Personalizable
- Mensaje de Recordatorio: Personalizable
- Hora de recordatorios: 09:00 (configurable)
```

#### Mensajes Personalizables

```javascript
// Variables disponibles en mensajes
${clientName} - Nombre del cliente
${appointmentDate} - Fecha del turno
${startTime} - Hora de inicio
${services} - Servicios contratados
${totalAmount} - Monto total
${address} - Dirección del servicio
```

---

## 📱 Notificaciones WhatsApp

### Tipos de Notificaciones

#### 1. Confirmación de Turno
```javascript
// Se envía automáticamente al confirmar
"¡Hola ${clientName}! Tu turno ha sido confirmado:
📅 Fecha: ${appointmentDate}
⏰ Hora: ${startTime}
📍 Dirección: ${address}
🛠️ Servicios: ${services}
💰 Total: $${totalAmount}
¡Gracias por elegir Daytona Clean Service! 🚗✨"
```

#### 2. Recordatorio
```javascript
// Se envía automáticamente el día anterior
"¡Hola ${clientName}! Te recordamos tu turno de mañana:
📅 Fecha: ${appointmentDate}
⏰ Hora: ${startTime}
📍 Dirección: ${address}
¡Nos vemos pronto! 🚗✨"
```

#### 3. Cancelación
```javascript
// Se envía al cancelar un turno
"¡Hola ${clientName}! Tu turno ha sido cancelado:
📅 Fecha: ${appointmentDate}
⏰ Hora: ${startTime}
Motivo: ${cancellationReason}
Para reagendar, contáctanos. ¡Disculpa las molestias!"
```

### Configuración de Recordatorios

```javascript
// En config.env
REMINDER_TIME=09:00
REMINDER_TIMEZONE=America/Argentina/Buenos_Aires

// El sistema envía recordatorios automáticamente
// a las 9:00 AM del día anterior al turno
```

---

## 🔧 Mantenimiento

### 1. Logs del Sistema

```bash
# Ver logs en tiempo real
tail -f backend/logs/app.log

# Logs importantes
- Creación de turnos
- Confirmaciones
- Cancelaciones
- Errores de notificaciones
- Accesos al admin
```

### 2. Backup de Base de Datos

```bash
# Crear backup
mysqldump -u root -p daytona_turnos > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p daytona_turnos < backup_20241201.sql
```

### 3. Monitoreo de Salud

```javascript
// Endpoint de salud
GET /api/health

// Respuesta esperada
{
  "success": true,
  "message": "API funcionando correctamente",
  "database": "connected",
  "timestamp": "2024-12-01T10:00:00.000Z"
}
```

### 4. Limpieza de Datos

```sql
-- Limpiar turnos cancelados antiguos (más de 30 días)
DELETE FROM appointments 
WHERE status = 'cancelled' 
AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Limpiar notificaciones antiguas (más de 90 días)
DELETE FROM notifications 
WHERE sent_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar configuración
mysql -u root -p -h localhost

# Verificar variables de entorno
cat backend/config.env
```

#### 2. Notificaciones WhatsApp No Envían
```javascript
// Verificar configuración
- WHATSAPP_ENABLED=true
- WHATSAPP_PHONE_NUMBER correcto
- API de WhatsApp funcionando

// Verificar logs
tail -f backend/logs/app.log | grep whatsapp
```

#### 3. Panel Admin No Carga
```javascript
// Verificar
- Servidor backend ejecutándose
- Puerto 3000 disponible
- Archivos admin/ accesibles
- Token JWT válido
```

#### 4. Turnos No Se Crean
```javascript
// Verificar
- Base de datos conectada
- Tablas creadas correctamente
- Permisos de escritura
- Logs de errores
```

---

## 📞 Soporte

### Contacto Técnico
- **Desarrollador:** Benjamín Gianneschi
- **Email:** benjamin@daytona.com.ar
- **WhatsApp:** +5493482588383

### Recursos Adicionales
- **Documentación API:** `/api/health`
- **Logs del Sistema:** `backend/logs/app.log`
- **Base de Datos:** `daytona_turnos`

---

## 🔄 Actualizaciones

### Proceso de Actualización
```bash
# 1. Hacer backup
mysqldump -u root -p daytona_turnos > backup_pre_update.sql

# 2. Actualizar código
git pull origin main

# 3. Instalar dependencias
npm install

# 4. Ejecutar migraciones (si las hay)
# 5. Reiniciar servidor
npm restart

# 6. Verificar funcionamiento
curl http://localhost:3000/api/health
```

---

*Esta guía se actualiza regularmente. Última actualización: Diciembre 2024* 