# Configuración con Base de Datos de Render

## 🎯 Objetivo

Configurar tu entorno local para usar la misma base de datos PostgreSQL que tienes en Render.

## ✅ Ventajas

1. **Datos reales** - Trabajas con los mismos datos que en producción
2. **Sin migración** - No necesitas crear una nueva base de datos
3. **Pruebas reales** - Puedes probar con usuarios y turnos reales
4. **Sincronización** - Los cambios se reflejan inmediatamente

## 🔧 Pasos para Configurar

### Paso 1: Obtener Credenciales de Render

```bash
cd backend
node scripts/get-render-credentials.js
```

Este script te mostrará:
- ✅ Archivos de configuración existentes
- ✅ Variables de entorno detectadas
- ✅ Instrucciones para configurar manualmente

### Paso 2: Configurar Variables de Entorno

**Si ya tienes config.env:**
```bash
# Verificar que contenga las variables correctas
cat config.env
```

**Si no tienes config.env, crear uno:**
```bash
# Copiar la configuración de ejemplo
cp config.env.postgres config.env
```

**Editar config.env con tus credenciales de Render:**
```env
DB_TYPE=postgres
DB_HOST=tu-host-de-render.render.com
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=tu-base-de-datos
DB_PORT=5432
JWT_SECRET=daytona-secret-key-2024
JWT_EXPIRES_IN=24h
SESSION_SECRET=daytona-session-secret-2024
PORT=3000
NODE_ENV=development
```

### Paso 3: Probar Conexión a Render

```bash
cd backend
node scripts/setup-postgres-render.js
```

Este script:
- ✅ Se conecta a tu base de datos de Render
- ✅ Verifica la estructura de las tablas
- ✅ Muestra usuarios y turnos existentes
- ✅ Crea usuario de prueba si es necesario

### Paso 4: Reiniciar Servidor

```bash
npm restart
```

### Paso 5: Probar Funcionalidad

1. **Ir a la página de login**
2. **Usar credenciales existentes** o las de prueba:
   - Email: `test@daytona.com`
   - Contraseña: `password123`
3. **Verificar que inicia sesión**
4. **Ir a `mi-cuenta.html`**
5. **Verificar historial de turnos**

## 🔍 Cómo Obtener Credenciales de Render

### Desde el Dashboard de Render:

1. **Ve a tu dashboard**: https://dashboard.render.com
2. **Selecciona tu servicio** de base de datos PostgreSQL
3. **Ve a la pestaña "Info"** o "Connections"
4. **Copia las credenciales**:
   - **Host**: `tu-db.render.com`
   - **User**: `tu-usuario`
   - **Password**: `tu-contraseña`
   - **Database**: `tu-base-de-datos`
   - **Port**: `5432`

### Ejemplo de config.env:
```env
DB_TYPE=postgres
DB_HOST=dpg-abc123def456.render.com
DB_USER=daytona_user
DB_PASSWORD=abc123def456
DB_NAME=daytona_turnos
DB_PORT=5432
JWT_SECRET=daytona-secret-key-2024
JWT_EXPIRES_IN=24h
SESSION_SECRET=daytona-session-secret-2024
PORT=3000
NODE_ENV=development
```

## 🎯 Resultado Esperado

Después de la configuración:

1. **✅ Conexión exitosa** a la base de datos de Render
2. **✅ Usuarios existentes** visibles
3. **✅ Turnos existentes** en el historial
4. **✅ Login funciona** con usuarios reales
5. **✅ Sin errores 401** en la consola
6. **✅ Historial completo** en mi-cuenta.html

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED"
- Verifica que las credenciales sean correctas
- Verifica que la base de datos de Render esté activa
- Verifica que el host y puerto sean correctos

### Error: "password authentication failed"
- Verifica la contraseña en config.env
- Verifica que el usuario tenga permisos
- Intenta regenerar la contraseña en Render

### Error: "database does not exist"
- Verifica el nombre de la base de datos
- Verifica que la base de datos esté creada en Render

### Error: "relation does not exist"
- Ejecuta `setup-postgres-render.js` para verificar estructura
- Verifica que las tablas existan en Render

## 📋 Checklist de Verificación

- [ ] Credenciales de Render obtenidas
- [ ] config.env configurado correctamente
- [ ] Conexión exitosa a Render (`setup-postgres-render.js`)
- [ ] Tablas verificadas (users, appointments, services)
- [ ] Usuarios existentes detectados
- [ ] Servidor reiniciado
- [ ] Login funciona en navegador
- [ ] Historial de turnos se carga
- [ ] Sin errores en consola

## 🚀 Beneficios

Una vez configurado:

- ✅ **Desarrollo con datos reales**
- ✅ **Pruebas más precisas**
- ✅ **Sin problemas de sincronización**
- ✅ **Despliegue más confiable**
- ✅ **Debugging más efectivo**

---

**Estado**: ✅ Configuración implementada  
**Fecha**: Diciembre 2024 