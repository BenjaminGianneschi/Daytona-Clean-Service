# Despliegue en Render - Daytona Clean Service

## Configuración del Proyecto

### 1. Variables de Entorno Requeridas

Asegúrate de configurar las siguientes variables de entorno en tu proyecto de Render:

#### Variables de Base de Datos (se configuran automáticamente)
- `DB_HOST` - Host de la base de datos PostgreSQL
- `DB_USER` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_NAME` - Nombre de la base de datos
- `DB_PORT` - Puerto de la base de datos (5432 por defecto)

#### Variables de Seguridad
- `JWT_SECRET` - Clave secreta para JWT (se genera automáticamente)
- `SESSION_SECRET` - Clave secreta para sesiones (se genera automáticamente)
- `JWT_EXPIRES_IN` - Tiempo de expiración de JWT (24h)

#### Variables de Configuración
- `NODE_ENV` - Entorno (production)
- `PORT` - Puerto del servidor (10000)
- `WHATSAPP_ENABLED` - Habilitar WhatsApp (true)
- `WHATSAPP_PHONE_NUMBER` - Número de WhatsApp (5493482588383)
- `WORK_START_HOUR` - Hora de inicio de trabajo (8)
- `WORK_END_HOUR` - Hora de fin de trabajo (18)
- `WORK_DAYS` - Días de trabajo (1,2,3,4,5,6)
- `TURN_DURATION` - Duración de turnos en minutos (120)
- `REMINDER_TIME` - Hora de recordatorios (09:00)
- `REMINDER_TIMEZONE` - Zona horaria (America/Argentina/Buenos_Aires)
- `LOG_LEVEL` - Nivel de logs (info)
- `ALLOWED_ORIGINS` - Orígenes permitidos para CORS

#### Variables de Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Ventana de rate limiting (900000)
- `RATE_LIMIT_MAX_REQUESTS` - Máximo de requests (100)

### 2. Configuración del render.yaml

El archivo `render.yaml` ya está configurado para:
- Crear automáticamente una base de datos PostgreSQL
- Configurar todas las variables de entorno necesarias
- Establecer el health check en `/api/health`

### 3. Comandos de Build y Start

- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Scripts de Configuración

#### Postinstall Script
El script `postinstall` ejecuta automáticamente la configuración de la base de datos:
```json
"postinstall": "npm run setup-db || echo 'Database setup failed, continuing deployment...'"
```

#### Setup Database Script
El script `setup-db` configura la base de datos PostgreSQL:
```json
"setup-db": "node scripts/setup-render.js"
```

### 5. Estructura de la Base de Datos

El sistema crea automáticamente las siguientes tablas:
- `users` - Usuarios del sistema
- `appointments` - Turnos/citas
- `services` - Servicios disponibles
- `settings` - Configuración del sistema
- `logs` - Logs del sistema

### 6. Usuario Administrador por Defecto

Se crea automáticamente un usuario administrador:
- **Email**: admin@daytona.com.ar
- **Contraseña**: admin123
- **Rol**: admin

### 7. Endpoints de la API

#### Health Check
- `GET /api/health` - Estado del servidor y base de datos

#### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

#### Turnos
- `GET /api/appointments` - Obtener turnos
- `POST /api/appointments` - Crear turno
- `PUT /api/appointments/:id` - Actualizar turno
- `DELETE /api/appointments/:id` - Eliminar turno

#### Usuarios
- `GET /api/users/profile` - Perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil

### 8. Solución de Problemas

#### Error de Sintaxis en PostgreSQL
Si encuentras errores de sintaxis como "current_time", verifica:
1. Que el archivo `schema-postgres.sql` no contenga palabras reservadas
2. Que todas las funciones estén correctamente definidas

#### Error de Conexión a la Base de Datos
Si hay problemas de conexión:
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que la base de datos PostgreSQL esté creada
3. Revisa los logs de Render para más detalles

#### Build Falla por Configuración de DB
El script está configurado para no fallar el build si hay problemas de DB:
- En desarrollo: falla con error
- En producción: continúa el despliegue

### 9. Monitoreo

#### Health Check
El endpoint `/api/health` devuelve:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "database": "connected",
  "timestamp": "2025-01-06T18:28:22.341Z"
}
```

#### Logs
Los logs se guardan en:
- Consola de Render
- Archivo `logs/app.log` (si está habilitado)

### 10. Seguridad

- CORS configurado para dominios específicos
- Rate limiting habilitado
- Helmet para headers de seguridad
- JWT para autenticación
- Sesiones seguras

### 11. WhatsApp Integration

El sistema incluye integración con WhatsApp para:
- Notificaciones de turnos
- Recordatorios automáticos
- Confirmaciones de citas

### 12. Cron Jobs

Se ejecutan automáticamente:
- Recordatorios de turnos
- Limpieza de logs antiguos
- Mantenimiento de la base de datos

# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu backend de Daytona Clean Service en Render.

## 📋 Prerrequisitos

1. Cuenta en [Render.com](https://render.com)
2. Repositorio Git con tu código
3. Base de datos MySQL (Render proporciona MySQL)

## 🛠️ Pasos para el Despliegue

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio contenga:
- ✅ `package.json` con todas las dependencias
- ✅ `server.js` como punto de entrada
- ✅ `render.yaml` para configuración automática
- ✅ `scripts/setup-render.js` para configuración de BD
- ✅ `database/schema.sql` con el esquema de la BD

### 2. Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Conecta tu repositorio

### 3. Desplegar con Blueprint (Recomendado)

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Blueprint"**
3. Conecta tu repositorio Git
4. Render detectará automáticamente el archivo `render.yaml`
5. Haz clic en **"Apply"**

### 4. Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

#### Crear Base de Datos MySQL
1. **New +** → **PostgreSQL** (Render no tiene MySQL, usa PostgreSQL)
2. Nombre: `daytona-db`
3. Plan: Free
4. Anota las credenciales

#### Crear Servicio Web
1. **New +** → **Web Service**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `daytona-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Variables de Entorno
Configura estas variables en el servicio web:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu_jwt_secret_super_seguro
SESSION_SECRET=tu_session_secret_super_seguro
DB_HOST=tu_host_de_postgresql
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_database
DB_PORT=5432
JWT_EXPIRES_IN=24h
REMINDER_TIME=09:00
REMINDER_TIMEZONE=America/Argentina/Buenos_Aires
WORK_START_HOUR=8
WORK_END_HOUR=18
WORK_DAYS=1,2,3,4,5,6
TURN_DURATION=120
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
ALLOWED_ORIGINS=https://daytona.com.ar,https://www.daytona.com.ar
```

### 5. Configurar Base de Datos

Si usas PostgreSQL en lugar de MySQL:

1. Instala el driver de PostgreSQL:
   ```bash
   npm install pg
   ```

2. Actualiza `config/database.js` para usar PostgreSQL
3. Convierte el esquema SQL de MySQL a PostgreSQL

### 6. Verificar el Despliegue

1. Ve a tu servicio web en Render
2. Espera a que el build termine
3. Verifica que la URL funcione: `https://tu-app.onrender.com/api/health`
4. Deberías ver:
   ```json
   {
     "success": true,
     "message": "API funcionando correctamente",
     "database": "connected",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

## 🔧 Configuración Adicional

### Dominio Personalizado
1. Ve a tu servicio web
2. **Settings** → **Custom Domains**
3. Agrega tu dominio: `api.daytona.com.ar`
4. Configura los registros DNS

### Variables de Entorno Sensibles
Para variables sensibles como JWT_SECRET:
1. Ve a **Environment**
2. Marca como **Secret**
3. Render las ocultará en los logs

### Logs y Monitoreo
- Los logs están disponibles en tiempo real
- Configura alertas para errores
- Monitorea el uso de recursos

## 🚨 Solución de Problemas

### Error de Conexión a BD
- Verifica las credenciales de la BD
- Asegúrate de que la BD esté activa
- Revisa los logs del servicio

### Error de Build
- Verifica que `package.json` esté correcto
- Revisa que todas las dependencias estén listadas
- Verifica la sintaxis del código

### Error de Puerto
- Render usa el puerto 10000 por defecto
- Asegúrate de que `process.env.PORT` esté configurado

### CORS Errors
- Verifica `ALLOWED_ORIGINS` en las variables de entorno
- Asegúrate de que tu frontend esté en la lista

## 📞 Soporte

- [Documentación de Render](https://render.com/docs)
- [Comunidad de Render](https://community.render.com)
- Logs en tiempo real en el dashboard

## 🔄 Actualizaciones

Para actualizar tu aplicación:
1. Haz push a tu repositorio Git
2. Render detectará automáticamente los cambios
3. Iniciará un nuevo build y despliegue
4. La aplicación se actualizará sin tiempo de inactividad

---

¡Tu backend de Daytona Clean Service estará listo para producción en Render! 🎉 