# 🚗 Sistema de Turnos - Daytona Clean Service

Sistema completo de gestión de turnos con panel de administración, notificaciones WhatsApp y gestión de servicios.

## ⚡ Inicio Rápido

### 1. Configuración Automática
```bash
# Dar permisos de ejecución al script
chmod +x setup.sh

# Ejecutar configuración automática
./setup.sh
```

### 2. Iniciar Servidor
```bash
# Iniciar servidor
./start-server.sh

# O manualmente
cd backend && npm start
```

### 3. Acceder al Sistema
- **Frontend (Clientes):** http://localhost:3000/turnos.html
- **Panel Admin:** http://localhost:3000/admin/
- **Credenciales Admin:** `admin` / `admin123`

## 🏗️ Arquitectura del Sistema

```
Daytona/
├── backend/                 # API REST (Node.js + Express)
│   ├── config/             # Configuración de BD
│   ├── controllers/        # Lógica de negocio
│   ├── routes/            # Endpoints de la API
│   ├── services/          # Servicios (WhatsApp, etc.)
│   └── database/          # Esquema de BD
├── admin/                  # Panel de administración
│   ├── index.html         # Interfaz admin
│   ├── js/admin.js        # Lógica del admin
│   └── css/admin.css      # Estilos del admin
├── turnos.html            # Página de reserva de turnos
├── js/api-service.js      # Cliente API
└── setup.sh               # Script de configuración
```

## 📊 Base de Datos

### Tablas Principales
- **appointments:** Turnos reservados
- **clients:** Información de clientes
- **services:** Catálogo de servicios
- **admins:** Usuarios del panel admin
- **notifications:** Historial de notificaciones
- **blocked_dates:** Días bloqueados

### Servicios Disponibles
- **Vehículos:** Lavado, tapizado, motor
- **Tapizados:** Sillones, sillas, colchones, alfombras, puffs

## 🔧 Configuración

### Variables de Entorno (`backend/config.env`)
```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=daytona_turnos

# JWT
JWT_SECRET=tu_secret_super_seguro
JWT_EXPIRES_IN=24h

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER=5493482588383

# Horarios
WORK_START_HOUR=8
WORK_END_HOUR=18
TURN_DURATION=120
```

## 📱 Funcionalidades

### Para Clientes
- ✅ Reserva de turnos online
- ✅ Selección de múltiples servicios
- ✅ Cálculo automático de precios
- ✅ Confirmación por WhatsApp
- ✅ Recordatorios automáticos

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de turnos (ver, confirmar, cancelar)
- ✅ Filtros y búsqueda avanzada
- ✅ Configuración de horarios
- ✅ Gestión de días bloqueados
- ✅ Notificaciones personalizables
- ✅ Exportación de datos

## 🔄 Flujo de Trabajo

### 1. Reserva de Turno
```
Cliente → turnos.html → Selecciona servicios → 
Elige fecha/hora → Ingresa datos → Confirma → 
WhatsApp automático → Admin recibe notificación
```

### 2. Gestión de Turno
```
Admin → Panel admin → Ve turnos pendientes → 
Revisa detalles → Confirma/Cancela → 
Notificación automática al cliente
```

### 3. Recordatorios
```
Sistema → Cron job diario → Busca turnos del día siguiente → 
Envía recordatorios por WhatsApp
```

## 🚨 Solución de Problemas

### Error de Conexión a BD
```bash
# Verificar MySQL
sudo systemctl status mysql

# Verificar configuración
cat backend/config.env | grep DB_
```

### Servidor No Inicia
```bash
# Verificar puerto
lsof -i :3000

# Verificar logs
tail -f backend/logs/app.log
```

### WhatsApp No Funciona
```bash
# Verificar configuración
grep WHATSAPP backend/config.env

# Verificar logs
tail -f backend/logs/app.log | grep whatsapp
```

## 📈 Monitoreo

### Endpoints de Salud
```bash
# Estado general
curl http://localhost:3000/api/health

# Respuesta esperada
{
  "success": true,
  "database": "connected",
  "timestamp": "2024-12-01T10:00:00.000Z"
}
```

### Logs Importantes
```bash
# Logs en tiempo real
tail -f backend/logs/app.log

# Solo errores
tail -f backend/logs/app.log | grep ERROR

# Solo turnos
tail -f backend/logs/app.log | grep appointment
```

## 🔒 Seguridad

### Autenticación
- JWT tokens para sesiones admin
- Contraseñas hasheadas con bcrypt
- Rate limiting en endpoints críticos

### Validación
- Validación de datos en frontend y backend
- Sanitización de inputs
- Protección contra SQL injection

## 📞 Soporte

### Contacto
- **Desarrollador:** Benjamín Gianneschi
- **WhatsApp:** +5493482588383
- **Email:** benjamin@daytona.com.ar

### Documentación
- **Guía Completa:** `GUIA_ADMINISTRACION.md`
- **API Docs:** `http://localhost:3000/api/health`

## 🔄 Actualizaciones

### Proceso de Actualización
```bash
# 1. Backup
mysqldump -u root -p daytona_turnos > backup.sql

# 2. Actualizar código
git pull origin main

# 3. Reinstalar dependencias
cd backend && npm install

# 4. Reiniciar
./stop-server.sh && ./start-server.sh
```

## 📋 Checklist de Producción

- [ ] Cambiar JWT_SECRET por defecto
- [ ] Configurar HTTPS
- [ ] Configurar dominio en CORS
- [ ] Configurar WhatsApp API
- [ ] Configurar backup automático
- [ ] Configurar monitoreo
- [ ] Cambiar credenciales admin por defecto
- [ ] Configurar logs de producción

---

*Sistema desarrollado para Daytona Clean Service - Reconquista, Santa Fe* 