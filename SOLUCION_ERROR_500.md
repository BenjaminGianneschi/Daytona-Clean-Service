# 🔧 Solución para Error 500 en Registro de Usuarios

## 📋 Problema Identificado

El error 500 al intentar registrar usuarios indica que hay un problema con la estructura de la base de datos en Render. Específicamente, el código está intentando usar una columna `password_hash` que no existe en el esquema PostgreSQL.

## 🛠️ Soluciones Implementadas

### 1. Script de Verificación de Base de Datos

Se creó el script `backend/scripts/fix-database.js` que:
- Verifica si la tabla `users` existe
- Corrige las columnas faltantes o incorrectas
- Renombra `password_hash` a `password` si es necesario
- Agrega columnas faltantes como `phone`, `role`, `created_at`, `updated_at`

### 2. Verificación Automática al Iniciar

El servidor ahora ejecuta automáticamente la verificación de la base de datos al iniciar, asegurando que la estructura sea correcta.

### 3. Scripts de Diagnóstico

Se agregaron scripts útiles al `package.json`:
- `npm run fix-db`: Ejecuta la corrección de la base de datos
- `npm run check-db`: Verifica específicamente la base de datos en Render
- `npm run diagnose`: Diagnóstico completo del sistema

## 🚀 Pasos para Solucionar

### Opción 1: Deploy Automático (Recomendado)

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Fix database structure and add verification scripts"
   git push origin main
   ```

2. **Esperar el deploy automático en Render** (2-3 minutos)

3. **Verificar que el servidor inicie correctamente** revisando los logs en Render

### Opción 2: Ejecutar Script Manualmente

Si el deploy automático no funciona, puedes ejecutar el script manualmente:

1. **Ir al dashboard de Render**
2. **Seleccionar tu servicio**
3. **Ir a la pestaña "Shell"**
4. **Ejecutar:**
   ```bash
   npm run fix-db
   ```

### Opción 3: Diagnóstico Completo

Para ver exactamente qué está pasando:

1. **En la shell de Render, ejecutar:**
   ```bash
   npm run diagnose
   ```

2. **Revisar la salida** para identificar problemas específicos

## 🔍 Verificación

Después de aplicar las correcciones:

1. **Probar el registro** en: https://daytona-clean-service.onrender.com/register.html
2. **Verificar que no aparezcan errores 500**
3. **Confirmar que el usuario se registra correctamente**

## 📊 Estructura Correcta de la Tabla Users

La tabla `users` debe tener esta estructura:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🆘 Si el Problema Persiste

Si después de aplicar estas correcciones el error 500 persiste:

1. **Revisar los logs de Render** para ver errores específicos
2. **Ejecutar el diagnóstico completo** con `npm run diagnose`
3. **Verificar que las variables de entorno** estén configuradas correctamente
4. **Contactar soporte** con los logs del diagnóstico

## 📝 Notas Importantes

- Los scripts de verificación son seguros y no eliminan datos existentes
- Solo corrigen la estructura de la base de datos
- El servidor se reiniciará automáticamente después del deploy
- Los cambios son compatibles con datos existentes 