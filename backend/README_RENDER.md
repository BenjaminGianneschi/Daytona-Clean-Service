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