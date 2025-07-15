# 🔔 Sistema de Notificaciones - Daytona Clean Service

## 📋 Resumen

El sistema de notificaciones de Daytona Clean Service permite enviar notificaciones automáticas a los clientes cuando:

- ✅ **Se confirma un turno** (desde el panel de administración)
- ❌ **Se cancela un turno** (desde el panel de administración)
- ⏰ **Se envía un recordatorio** (automático el día del turno o manual)
- 🔄 **Se reprograma un turno** (futuro)

## 🚀 Funcionalidades Implementadas

### 1. **Notificaciones por WhatsApp**
- ✅ Confirmación de turno
- ❌ Cancelación de turno
- ⏰ Recordatorio del día del turno
- 🔄 Reprogramación de turno

### 2. **Notificaciones Web**
- Sistema de notificaciones en tiempo real
- Polling automático cada 30 segundos
- Notificaciones con animaciones y auto-cierre
- Diferentes tipos con iconos y colores

### 3. **Panel de Administración**
- Botón para confirmar turnos (envía notificación automática)
- Botón para cancelar turnos (envía notificación automática)
- Botón para enviar recordatorios manuales
- Botón para probar el sistema de notificaciones

### 4. **Recordatorios Automáticos**
- Cron job que se ejecuta todos los días a las 9:00 AM
- Envía recordatorios a turnos confirmados para el día siguiente
- Sistema de control para evitar recordatorios duplicados

## 🛠️ Configuración

### Variables de Entorno Requeridas

```env
# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER=5493482588383
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_KEY=your_api_key_here

# Notificaciones
NOTIFICATIONS_ENABLED=true

# Recordatorios
REMINDER_TIME=09:00
REMINDER_TIMEZONE=America/Argentina/Buenos_Aires
```

## 📁 Estructura de Archivos

```
backend/
├── services/
│   ├── notificationService.js    # Servicio principal de notificaciones
│   └── whatsappService.js        # Servicio de WhatsApp
├── routes/
│   └── notifications.js          # Rutas de notificaciones
├── scripts/
│   └── reminderCron.js           # Cron job de recordatorios
└── public/js/
    └── notifications.js          # Sistema de notificaciones web
```

## 🔧 Uso del Sistema

### Para Administradores

#### 1. **Confirmar un Turno**
```javascript
// Se ejecuta automáticamente al hacer clic en "Confirmar"
// Envía notificación por WhatsApp y web
```

#### 2. **Cancelar un Turno**
```javascript
// Se ejecuta automáticamente al hacer clic en "Cancelar"
// Envía notificación por WhatsApp y web
```

#### 3. **Enviar Recordatorio Manual**
```javascript
// Se ejecuta al hacer clic en el botón de campana
// Envía recordatorio por WhatsApp y web
```

#### 4. **Probar Sistema**
```javascript
// Se ejecuta al hacer clic en "Probar Notificaciones"
// Envía notificaciones de prueba
```

### Para Clientes

#### 1. **Notificaciones Web**
- Se muestran automáticamente en la esquina superior derecha
- Se auto-cierran después de 10 segundos
- Se pueden cerrar manualmente haciendo clic en "×"

#### 2. **Notificaciones por WhatsApp**
- Se envían automáticamente al número registrado
- Incluyen información detallada del turno
- Formato profesional con emojis y estructura clara

## 📱 Tipos de Mensajes

### Confirmación de Turno
```
¡Hola [Nombre]! 🎉

✅ Tu turno ha sido confirmado exitosamente:

📅 Fecha: [Fecha]
⏰ Hora: [Hora]
📍 Dirección: [Dirección]
💰 Total: $[Total]

🛠️ Servicios:
• [Servicio 1] x[1]
• [Servicio 2] x[1]

📞 Contacto: [Teléfono]

⚠️ Importante:
• Llegá 10 minutos antes del horario
• Si necesitás cancelar, avisanos con 24h de anticipación
• Traé los elementos necesarios para el servicio

¡Gracias por elegir Daytona Clean Service! 🚗✨
```

### Cancelación de Turno
```
¡Hola [Nombre]! 😔

❌ Tu turno ha sido cancelado

📅 Fecha: [Fecha]
⏰ Hora: [Hora]
📝 Motivo: [Motivo]

🔄 ¿Qué hacer?
• Podés reagendar tu turno cuando quieras
• Contactanos para coordinar nueva fecha
• No se te cobrará ningún cargo

¡Disculpá las molestias! 🙏
```

### Recordatorio de Turno
```
¡Hola [Nombre]! ⏰

📅 Recordatorio: Tu turno es mañana

📅 Fecha: [Fecha]
⏰ Hora: [Hora]
📍 Dirección: [Dirección]

⚠️ Recordá:
• Llegá 10 minutos antes
• Traé los elementos necesarios
• Si no podés venir, avisanos lo antes posible

¡Te esperamos! 🚗✨
```

## 🔄 Flujo de Notificaciones

### Confirmación de Turno
1. Admin hace clic en "Confirmar" en el panel
2. Se actualiza el estado del turno a "confirmed"
3. Se envía notificación por WhatsApp al cliente
4. Se muestra notificación web en tiempo real
5. Se registra la acción en logs

### Cancelación de Turno
1. Admin hace clic en "Cancelar" en el panel
2. Se actualiza el estado del turno a "cancelled"
3. Se envía notificación por WhatsApp al cliente
4. Se muestra notificación web en tiempo real
5. Se registra la acción en logs

### Recordatorio Automático
1. Cron job se ejecuta todos los días a las 9:00 AM
2. Busca turnos confirmados para el día siguiente
3. Envía recordatorio por WhatsApp a cada cliente
4. Marca como recordatorio enviado en la base de datos
5. Se registra la acción en logs

## 🧪 Pruebas

### Probar Sistema Completo
1. Ir al panel de administración
2. Hacer clic en "Probar Notificaciones"
3. Ingresar número de teléfono (opcional)
4. Verificar que se envíen las notificaciones

### Probar Notificaciones Individuales
1. Confirmar un turno → Verificar notificación de confirmación
2. Cancelar un turno → Verificar notificación de cancelación
3. Enviar recordatorio → Verificar notificación de recordatorio

## 🐛 Solución de Problemas

### WhatsApp no funciona
- Verificar `WHATSAPP_ENABLED=true`
- Verificar `WHATSAPP_PHONE_NUMBER`
- Revisar logs del servidor

### Notificaciones web no aparecen
- Verificar que el archivo `notifications.js` esté cargado
- Verificar que el usuario esté logueado
- Revisar consola del navegador

### Recordatorios automáticos no se envían
- Verificar que el cron job esté iniciado
- Verificar zona horaria configurada
- Revisar logs del servidor

## 🔮 Próximas Mejoras

- [ ] Base de datos para notificaciones web
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Notificaciones push para móviles
- [ ] Plantillas personalizables de mensajes
- [ ] Historial de notificaciones enviadas
- [ ] Configuración de horarios de recordatorios
- [ ] Notificaciones por email

## 📞 Soporte

Para problemas o consultas sobre el sistema de notificaciones:
- **Email**: admin@daytona.com.ar
- **WhatsApp**: +54 9 3482 588383 