# 🚗 Daytona Clean Service - Sistema de Turnos Completo

Sistema completo de gestión de turnos para servicios de limpieza de autos y tapizados, con backend Node.js, panel de administración y notificaciones WhatsApp automáticas.

## 📋 Características

### 🎯 Frontend (Cliente)
- **Sistema de turnos inteligente** con categorización automática
- **Turnos separados** para vehículos y tapizados
- **Precios actualizados** según tabla de promociones
- **Validación en tiempo real** de disponibilidad
- **Integración con WhatsApp** para confirmaciones
- **Interfaz responsive** y moderna

### 🔧 Backend (API)
- **API RESTful** con Node.js y Express
- **Base de datos PostgreSQL** con esquema completo
- **Autenticación JWT** para administradores
- **Validación de datos** y manejo de errores
- **Rate limiting** y seguridad
- **Logging** completo

### 👨‍💼 Panel de Administración
- **Dashboard** con estadísticas en tiempo real
- **Gestión completa de turnos** (ver, confirmar, cancelar)
- **Filtros avanzados** y búsqueda
- **Configuración del sistema** (horarios, bloqueos)
- **Gestión de usuarios** administradores
- **Exportación de datos**

### 📱 Notificaciones WhatsApp
- **Confirmaciones automáticas** al crear turnos
- **Recordatorios automáticos** 24h antes
- **Notificaciones de cancelación** y reprogramación
- **Mensajes personalizables**
- **Cron jobs** para automatización

## 🏗️ Arquitectura del Sistema

```
Daytona/
├── 📁 Frontend (Cliente)
│   ├── turnos.html          # Sistema de turnos principal
│   ├── js/
│   │   ├── api-service.js   # Servicio de API
│   │   └── ...              # Otros scripts
│   └── css/                 # Estilos
├── 📁 Backend (API)
│   ├── server.js            # Servidor principal
│   ├── controllers/         # Controladores de la API
│   ├── routes/              # Rutas de la API
│   ├── middleware/          # Middleware de autenticación
│   ├── services/            # Servicios (WhatsApp)
│   ├── scripts/             # Cron jobs
│   └── database/            # Esquema de base de datos
└── 📁 Admin Panel
    ├── index.html           # Panel principal
    ├── css/admin.css        # Estilos del panel
    └── js/admin.js          # Lógica del panel
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** 16+ 
- **PostgreSQL** 12.0+
- **npm** o **yarn**

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd Daytona
```

### 2. Configurar Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres -d daytona_turnos

# Crear base de datos
CREATE DATABASE daytona_turnos;
USE daytona_turnos;

# Ejecutar esquema
source backend/database/schema.sql;
```

### 3. Configurar Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp config.env.example config.env
# Editar config.env con tus datos
```

### 4. Variables de Entorno (config.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=daytona_turnos
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_API_KEY=tu_api_key
WHATSAPP_PHONE_NUMBER=5493482588383
WHATSAPP_API_URL=https://api.whatsapp.com/send

# Horarios
WORK_START_HOUR=8
WORK_END_HOUR=18
WORK_DAYS=1,2,3,4,5,6
TURN_DURATION=120

# Recordatorios
REMINDER_TIME=09:00
REMINDER_TIMEZONE=America/Argentina/Buenos_Aires
```

### 5. Iniciar Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 6. Configurar Frontend
El frontend ya está configurado para conectarse al backend en `http://localhost:3000`.

### 7. Acceder al Sistema
- **Cliente**: `http://localhost:5500/turnos.html`
- **Admin Panel**: `http://localhost:5500/admin/`
- **API Health**: `http://localhost:3000/api/health`

## 📊 Base de Datos

### Tablas Principales
- **admins**: Administradores del sistema
- **clients**: Clientes registrados
- **appointments**: Turnos programados
- **services**: Servicios disponibles
- **appointment_services**: Servicios por turno
- **work_schedules**: Horarios de trabajo
- **blocked_dates**: Fechas bloqueadas
- **service_locations**: Ubicaciones de servicio
- **notifications**: Historial de notificaciones

### Datos Iniciales
```sql
-- Administrador por defecto
INSERT INTO admins (username, password, role) VALUES 
('admin', '$2a$10$...', 'super_admin');

-- Horarios de trabajo
INSERT INTO work_schedules (day_of_week, is_working_day, start_time, end_time) VALUES 
(1, 1, '08:00:00', '18:00:00'), -- Lunes
(2, 1, '08:00:00', '18:00:00'), -- Martes
(3, 1, '08:00:00', '18:00:00'), -- Miércoles
(4, 1, '08:00:00', '18:00:00'), -- Jueves
(5, 1, '08:00:00', '18:00:00'), -- Viernes
(6, 1, '08:00:00', '18:00:00'), -- Sábado
(0, 0, '00:00:00', '00:00:00'); -- Domingo
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de administrador
- `POST /api/auth/verify` - Verificar token
- `PUT /api/auth/change-password` - Cambiar contraseña

### Turnos
- `GET /api/appointments/availability/:date` - Obtener disponibilidad
- `POST /api/appointments` - Crear turno
- `GET /api/appointments` - Listar turnos (admin)
- `GET /api/appointments/:id` - Obtener turno específico
- `PUT /api/appointments/:id/status` - Actualizar estado
- `PUT /api/appointments/:id/cancel` - Cancelar turno

### Sistema
- `GET /api/health` - Estado de la API

## 📱 Configuración de WhatsApp

### Opción 1: WhatsApp Web (Simulado)
Para desarrollo, el sistema simula el envío de mensajes.

### Opción 2: API Externa
Para producción, configurar una API de WhatsApp:

1. **Twilio WhatsApp API**
2. **MessageBird**
3. **WhatsApp Business API**

```env
WHATSAPP_API_KEY=tu_api_key
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/...
```

## 🎛️ Panel de Administración

### Funcionalidades
- **Dashboard** con estadísticas en tiempo real
- **Gestión de turnos** completa
- **Filtros y búsqueda** avanzada
- **Configuración del sistema**
- **Gestión de usuarios**
- **Exportación de datos**

### Acceso
1. Ir a `http://localhost:5500/admin/`
2. Login con credenciales de administrador
3. Gestionar turnos y configuración

## 🔄 Cron Jobs

### Recordatorios Automáticos
- **Ejecución**: Diaria a las 9:00 AM
- **Función**: Enviar recordatorios 24h antes
- **Configuración**: `backend/scripts/reminderCron.js`

### Limpieza Automática
- **Ejecución**: Semanal
- **Función**: Limpiar recordatorios antiguos
- **Configuración**: Automática

## 🛡️ Seguridad

### Implementada
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Rate limiting** (100 req/15min)
- **JWT** para autenticación
- **Validación** de datos
- **Sanitización** de inputs

### Recomendaciones
- Cambiar `JWT_SECRET` en producción
- Usar HTTPS en producción
- Configurar firewall
- Monitorear logs

## 📈 Monitoreo y Logs

### Logs del Sistema
- **Acceso**: `console.log` y archivos de log
- **Errores**: Captura automática
- **WhatsApp**: Logs de envío
- **Base de datos**: Queries y errores

### Métricas
- Turnos creados/cancelados
- Notificaciones enviadas
- Errores del sistema
- Performance de la API

## 🚀 Despliegue en Producción

### 1. Preparar Servidor
```bash
# Instalar Node.js y PostgreSQL
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib

# Configurar firewall
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
```

### 2. Configurar Base de Datos
```bash
# Crear usuario de aplicación
CREATE USER 'daytona'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON daytona_turnos.* TO 'daytona'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Desplegar Aplicación
```bash
# Clonar en servidor
git clone <repository>
cd Daytona/backend

# Instalar dependencias
npm install --production

# Configurar variables de entorno
cp config.env.example config.env
# Editar config.env

# Iniciar con PM2
npm install -g pm2
pm2 start server.js --name "daytona-api"
pm2 startup
pm2 save
```

### 4. Configurar Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/daytona;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. SSL/HTTPS
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com
```

## 🧪 Testing

### Pruebas Manuales
1. **Crear turno** desde frontend
2. **Verificar** en panel de admin
3. **Confirmar/cancelar** turno
4. **Verificar** notificaciones WhatsApp
5. **Probar** filtros y búsqueda

### Pruebas Automáticas (Futuro)
```bash
npm test
```

## 📞 Soporte

### Contacto
- **Email**: soporte@daytona.com.ar
- **WhatsApp**: +54 9 3482 588383
- **Documentación**: Este README

### Problemas Comunes
1. **Error de conexión a BD**: Verificar credenciales
2. **WhatsApp no envía**: Verificar API key
3. **CORS errors**: Verificar configuración
4. **JWT expirado**: Renovar token

## 🔄 Actualizaciones

### Mantenimiento
- **Backups** diarios de BD
- **Logs** de sistema
- **Monitoreo** de performance
- **Actualizaciones** de seguridad

### Versiones
- **v1.0.0**: Sistema base
- **v1.1.0**: Notificaciones WhatsApp
- **v1.2.0**: Panel de administración
- **v1.3.0**: Cron jobs y automatización

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

---

**¡Sistema listo para usar! 🚗✨**

Para comenzar, sigue los pasos de instalación y configuración. El sistema está diseñado para ser robusto, escalable y fácil de mantener. 