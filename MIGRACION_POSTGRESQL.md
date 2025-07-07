# Migración a PostgreSQL - Daytona Clean Service

## 🎯 Objetivo

Migrar completamente de MySQL a PostgreSQL para que funcione tanto en local como en la nube (Render).

## ✅ Ventajas de PostgreSQL

1. **Mejor rendimiento** para aplicaciones complejas
2. **Compatibilidad total** con Render
3. **Funciones avanzadas** (JSON, arrays, etc.)
4. **Mejor manejo de transacciones**
5. **Tipos de datos más ricos**

## 🔧 Pasos para la Migración

### Paso 1: Instalar PostgreSQL Localmente

**Opción A: Instalación Directa**
1. Descargar desde: https://www.postgresql.org/download/
2. Instalar con contraseña: `postgres`
3. Verificar que el servicio esté ejecutándose

**Opción B: Docker (Recomendado)**
```bash
docker run --name postgres-daytona \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=daytona_turnos \
  -p 5432:5432 \
  -d postgres:latest
```

### Paso 2: Probar Conexión

```bash
cd backend
node scripts/test-postgres-connection.js
```

Este script:
- ✅ Prueba diferentes configuraciones
- ✅ Verifica que PostgreSQL esté ejecutándose
- ✅ Muestra estructura de tablas existentes

### Paso 3: Configurar Base de Datos

```bash
cd backend
node scripts/setup-postgres-local.js
```

Este script:
- ✅ Crea la base de datos `daytona_turnos`
- ✅ Ejecuta el esquema completo
- ✅ Crea usuario de prueba
- ✅ Verifica que todo funcione

### Paso 4: Configurar Variables de Entorno

**Copiar configuración:**
```bash
cp config.env.postgres config.env
```

**O configurar manualmente:**
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=daytona_turnos
DB_PORT=5432
JWT_SECRET=daytona-secret-key-2024
```

### Paso 5: Probar Autenticación

```bash
cd backend
node scripts/test-auth.js
```

Este script:
- ✅ Prueba login con usuario de prueba
- ✅ Verifica generación de JWT
- ✅ Prueba endpoint de turnos

### Paso 6: Reiniciar Servidor

```bash
npm restart
```

### Paso 7: Probar en Navegador

1. **Ir a la página de login**
2. **Usar credenciales:**
   - Email: `test@daytona.com`
   - Contraseña: `password123`
3. **Verificar que inicia sesión**
4. **Ir a `mi-cuenta.html`**
5. **Verificar historial de turnos**

## 🔄 Cambios Realizados

### 1. **Configuración de Base de Datos**
- ✅ `database.js` - Detecta automáticamente PostgreSQL
- ✅ `database-postgres.js` - Configuración PostgreSQL
- ✅ `schema-postgres.sql` - Esquema optimizado

### 2. **Controladores Actualizados**
- ✅ `authController.js` - Sintaxis PostgreSQL (`$1`, `$2`, etc.)
- ✅ `appointmentController.js` - Compatible con PostgreSQL

### 3. **Scripts de Migración**
- ✅ `setup-postgres-local.js` - Configuración completa
- ✅ `test-postgres-connection.js` - Prueba conexión
- ✅ `test-auth.js` - Prueba autenticación

## 🎯 Resultado Esperado

Después de la migración:

1. **✅ Servidor inicia** sin errores
2. **✅ Login funciona** con usuario de prueba
3. **✅ JWT se genera** correctamente
4. **✅ Historial de turnos** se carga
5. **✅ Sin errores 401** en la consola
6. **✅ Compatible** con Render

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED"
- Verifica que PostgreSQL esté ejecutándose
- Verifica el puerto 5432
- Si usas Docker: `docker start postgres-daytona`

### Error: "password authentication failed"
- Verifica la contraseña en el script
- Cambia la contraseña en PostgreSQL si es necesario

### Error: "database does not exist"
- Ejecuta `setup-postgres-local.js` para crear la BD
- Verifica que el usuario tenga permisos

### Error: "relation does not exist"
- Ejecuta el esquema: `setup-postgres-local.js`
- Verifica que las tablas se crearon correctamente

## 📋 Checklist de Verificación

- [ ] PostgreSQL instalado y ejecutándose
- [ ] Conexión exitosa (`test-postgres-connection.js`)
- [ ] Base de datos creada (`setup-postgres-local.js`)
- [ ] Esquema ejecutado correctamente
- [ ] Usuario de prueba creado
- [ ] Variables de entorno configuradas
- [ ] Autenticación funciona (`test-auth.js`)
- [ ] Servidor inicia sin errores
- [ ] Login funciona en navegador
- [ ] Historial de turnos se carga
- [ ] Sin errores en consola

## 🚀 Despliegue a Render

Una vez que funcione localmente:

1. **Commit y push** de los cambios
2. **Render detectará** automáticamente PostgreSQL
3. **Variables de entorno** se configurarán automáticamente
4. **Despliegue exitoso** sin problemas de base de datos

---

**Estado**: ✅ Migración implementada  
**Fecha**: Diciembre 2024 