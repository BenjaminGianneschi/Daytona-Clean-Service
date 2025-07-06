# 🚀 Despliegue en Render - Daytona Clean Service

## ✅ Preparación Completada

Tu backend está completamente preparado para desplegarse en Render. He creado todos los archivos necesarios:

### 📁 Archivos Creados/Modificados

1. **`render.yaml`** - Configuración automática para Render
2. **`env.example`** - Variables de entorno para Render
3. **`scripts/setup-render.js`** - Script de configuración automática
4. **`config/database-postgres.js`** - Configuración para PostgreSQL
5. **`config/database-mysql.js`** - Configuración para MySQL (desarrollo)
6. **`config/database.js`** - Selector automático de base de datos
7. **`database/schema-postgres.sql`** - Esquema convertido para PostgreSQL
8. **`scripts/migrate-to-postgres.js`** - Script de migración MySQL → PostgreSQL
9. **`package.json`** - Actualizado con dependencias y scripts
10. **`README_RENDER.md`** - Guía completa de despliegue

## 🎯 Pasos para Desplegar

### 1. Subir a Git
```bash
cd backend
git add .
git commit -m "Preparado para despliegue en Render"
git push origin main
```

### 2. Crear Cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Conecta tu repositorio

### 3. Desplegar con Blueprint (Recomendado)
1. En Render Dashboard → **"New +"** → **"Blueprint"**
2. Conecta tu repositorio
3. Render detectará `render.yaml` automáticamente
4. Haz clic en **"Apply"**

### 4. Configuración Manual (Alternativa)
Si prefieres configurar manualmente:

#### Crear Base de Datos PostgreSQL
1. **New +** → **PostgreSQL**
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
DB_TYPE=postgres
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

## 🔄 Migración de Datos (Opcional)

Si tienes datos en MySQL local y quieres migrarlos:

1. Configura las variables de entorno de MySQL:
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DB=daytona_turnos
MYSQL_PORT=3306
```

2. Ejecuta la migración:
```bash
npm run migrate-to-postgres
```

## ✅ Verificación

1. Ve a tu servicio web en Render
2. Espera a que el build termine
3. Verifica: `https://tu-app.onrender.com/api/health`
4. Deberías ver:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuración del Frontend

Una vez que tengas la URL de tu backend en Render, actualiza el frontend:

1. En `js/api-service.js`, cambia la URL base:
```javascript
const API_BASE_URL = 'https://tu-app.onrender.com/api';
```

2. En `admin/js/admin.js`, actualiza la URL:
```javascript
const API_BASE_URL = 'https://tu-app.onrender.com/api';
```

## 🎉 ¡Listo!

Tu backend estará funcionando en producción con:
- ✅ Base de datos PostgreSQL
- ✅ Configuración automática
- ✅ Variables de entorno seguras
- ✅ Logs en tiempo real
- ✅ Escalabilidad automática
- ✅ HTTPS automático

## 📞 Soporte

- [Documentación de Render](https://render.com/docs)
- [Comunidad de Render](https://community.render.com)
- Logs en tiempo real en el dashboard

---

¡Tu sistema de turnos de Daytona Clean Service estará funcionando en la nube! 🚀 