# Backend - Sistema de Turnos Daytona Clean Service

Backend completo para el sistema de gestión de turnos de Daytona Clean Service, desarrollado con Node.js, Express y MySQL.

## 🚀 Características

- **Gestión de Turnos**: Crear, consultar, actualizar y cancelar turnos
- **Disponibilidad en Tiempo Real**: Verificar horarios disponibles automáticamente
- **Autenticación JWT**: Sistema seguro de login para administradores
- **Gestión de Clientes**: Base de datos de clientes con historial
- **Servicios Configurables**: Catálogo de servicios con precios y duraciones
- **Horarios de Trabajo**: Configuración flexible de días y horarios laborales
- **Bloqueo de Fechas**: Gestión de vacaciones, feriados y días no laborables
- **API RESTful**: Endpoints bien documentados y estructurados

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **MySQL** (versión 8.0 o superior)
- **npm** o **yarn**

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de configuración
cp config.env.example .env

# Editar las variables según tu configuración
nano .env
```

### 4. Configurar la base de datos
```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de creación de la base de datos
source database/schema.sql
```

### 5. Iniciar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=daytona_turnos
DB_PORT=3306

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Configuración WhatsApp (opcional)
WHATSAPP_API_KEY=tu_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=5493482588383

# Configuración de horarios de trabajo
WORK_START_HOUR=8
WORK_END_HOUR=18
WORK_DAYS=1,2,3,4,5,6

# Configuración de duración de turnos (en minutos)
TURN_DURATION=120
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verificar token (protegido)
- `PUT /api/auth/change-password` - Cambiar contraseña (protegido)
- `POST /api/auth/create-admin` - Crear nuevo admin (solo super admin)

### Turnos (Público)
- `GET /api/appointments/availability/:date` - Obtener disponibilidad
- `POST /api/appointments` - Crear nuevo turno

### Turnos (Protegido - Admin)
- `GET /api/appointments` - Listar todos los turnos
- `GET /api/appointments/:id` - Obtener turno específico
- `PUT /api/appointments/:id/status` - Actualizar estado
- `PUT /api/appointments/:id/cancel` - Cancelar turno

### Sistema
- `GET /` - Información de la API
- `GET /api/health` - Estado del servidor y base de datos

## 🔐 Autenticación

### Login de Administrador
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Usar Token en Requests
```bash
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 📊 Estructura de la Base de Datos

### Tablas Principales
- **admins**: Administradores del sistema
- **clients**: Clientes registrados
- **services**: Catálogo de servicios
- **appointments**: Turnos reservados
- **appointment_services**: Servicios por turno
- **work_schedules**: Horarios de trabajo
- **blocked_dates**: Fechas bloqueadas
- **service_locations**: Ubicaciones de servicio
- **notifications**: Historial de notificaciones

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
# Instalar dependencias de producción
npm install --production

# Configurar variables de entorno
NODE_ENV=production

# Iniciar servidor
npm start
```

### Con PM2 (Recomendado para producción)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "daytona-backend"

# Configurar inicio automático
pm2 startup
pm2 save
```

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en modo producción
- `npm run dev` - Iniciar servidor en modo desarrollo con nodemon
- `npm test` - Ejecutar tests (pendiente de implementar)

## 📝 Logs

Los logs se muestran en la consola con el siguiente formato:
```
2024-01-15T10:30:00.000Z - GET /api/health
2024-01-15T10:30:01.000Z - POST /api/auth/login
```

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: Límite de requests por IP
- **CORS**: Configuración de orígenes permitidos
- **JWT**: Autenticación basada en tokens
- **Validación**: Validación de datos de entrada
- **SQL Injection**: Prevención con prepared statements

## 🔄 Próximas Funcionalidades

- [ ] Panel de administración web
- [ ] Notificaciones automáticas por WhatsApp
- [ ] Reportes y estadísticas
- [ ] Integración con calendario
- [ ] Sistema de recordatorios
- [ ] Backup automático de base de datos

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: admin@daytona.com.ar
- **WhatsApp**: +54 9 3482 588383

## 📄 Licencia

Este proyecto es propiedad de Daytona Clean Service. 