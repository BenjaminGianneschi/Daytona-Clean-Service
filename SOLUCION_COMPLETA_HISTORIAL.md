# Solución Completa: Historial de Turnos

## 🚨 Problemas Identificados

1. **Error de Base de Datos**: No se puede conectar a MySQL
2. **Error de Autenticación**: El endpoint usa sesiones en lugar de JWT
3. **Campo Faltante**: La tabla `appointments` no tiene `user_id`

## ✅ Solución Paso a Paso

### Paso 1: Verificar MySQL

**Si usas XAMPP:**
1. Abre XAMPP Control Panel
2. Inicia MySQL
3. La contraseña suele estar vacía

**Si usas WAMP:**
1. Abre WAMP
2. Inicia MySQL
3. Verifica la contraseña

### Paso 2: Probar Conexión

```bash
cd backend
node scripts/test-db-connection.js
```

Este script:
- ✅ Prueba diferentes configuraciones de MySQL
- ✅ Verifica si la tabla `appointments` existe
- ✅ Agrega el campo `user_id` si no existe
- ✅ Crea el índice necesario

### Paso 3: Crear Datos de Prueba

```bash
cd backend
node scripts/create-test-data.js
```

Este script:
- ✅ Crea un usuario de prueba
- ✅ Crea un cliente de prueba
- ✅ Crea un turno de prueba
- ✅ Conecta el turno con el usuario

### Paso 4: Verificar Cambios en el Backend

Los siguientes archivos ya fueron modificados:

1. **`backend/routes/users.js`**: Endpoint actualizado para usar JWT
2. **`backend/controllers/appointmentController.js`**: Incluye `user_id` al crear turnos
3. **`backend/middleware/auth.js`**: Middleware opcional para autenticación
4. **`js/api-service.js`**: Envía token automáticamente

### Paso 5: Reiniciar el Servidor

**Opción 1: Usando el script de reinicio (recomendado)**
```bash
cd backend
npm restart
```

**Opción 2: Reinicio manual**
```bash
# En la terminal donde está ejecutándose el servidor:
# 1. Presiona Ctrl+C para detener el servidor
# 2. Ejecuta:
npm start
```

**Opción 3: Usando nodemon (para desarrollo)**
```bash
cd backend
npm run dev
```

### Paso 6: Probar la Funcionalidad

1. **Crear cuenta de usuario** (si no tienes una)
2. **Iniciar sesión**
3. **Ir a `mi-cuenta.html`**
4. **Verificar que aparece el historial**

## 🔍 Verificación

### Para Usuarios Registrados:
- ✅ Deben ver sus turnos en el historial
- ✅ Los turnos nuevos se guardan con su `user_id`

### Para Usuarios No Registrados:
- ✅ Pueden reservar turnos normalmente
- ✅ No ven historial (necesitan registrarse)

### Para Administradores:
- ✅ Pueden ver todos los turnos desde el panel admin

## 🛠️ Scripts Disponibles

### 1. `test-db-connection.js`
```bash
node scripts/test-db-connection.js
```
- Prueba conexión a MySQL
- Agrega campo `user_id` si no existe
- Muestra estructura de la tabla

### 2. `create-test-data.js`
```bash
node scripts/create-test-data.js
```
- Crea usuario de prueba: `test@daytona.com`
- Crea turno de prueba
- Conecta turno con usuario

### 3. `add-user-id-to-appointments-local.js`
```bash
node scripts/add-user-id-to-appointments-local.js
```
- Agrega solo el campo `user_id`
- Configuración local

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

**Solución:**
1. Verifica que MySQL esté ejecutándose
2. Si usas XAMPP, la contraseña suele estar vacía
3. Si tienes contraseña, modifica el script

### Error: "Token válido" pero "Error cargando turnos"

**Solución:**
1. Verifica que el campo `user_id` existe en la tabla
2. Verifica que hay turnos con `user_id` no nulo
3. Revisa la consola del navegador para errores específicos

### Error: "Tabla appointments no existe"

**Solución:**
1. Ejecuta el script de migración de la base de datos
2. Verifica que la base de datos `daytona_turnos` existe

## 📋 Checklist de Verificación

- [ ] MySQL está ejecutándose
- [ ] Campo `user_id` existe en tabla `appointments`
- [ ] Índice `idx_appointments_user` existe
- [ ] Endpoint `/users/appointments` usa JWT
- [ ] API Service envía token automáticamente
- [ ] Usuario de prueba creado
- [ ] Turno de prueba creado y conectado
- [ ] Servidor reiniciado
- [ ] Historial funciona en `mi-cuenta.html`

## 🎯 Resultado Esperado

Después de seguir estos pasos:

1. **Usuario registrado reserva turno** → Se guarda con `user_id`
2. **Usuario ve historial** → Ve todos sus turnos
3. **Usuario no registrado** → No ve historial (normal)
4. **Admin** → Ve todos los turnos desde panel

---

**Estado**: ✅ Solución completa implementada  
**Fecha**: Diciembre 2024 