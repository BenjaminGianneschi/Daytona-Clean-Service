# 🔗 Actualizar URL de Render en el Frontend

## ⚠️ IMPORTANTE: Actualizar la URL de tu aplicación

El frontend está configurado para usar una URL genérica de Render. Necesitas actualizar la URL específica de tu aplicación.

## 📝 Pasos para actualizar:

### 1. Obtener tu URL de Render
Ve a tu dashboard de Render y copia la URL de tu aplicación. Debería ser algo como:
```
https://tu-app.onrender.com
```

### 2. Actualizar el archivo de configuración
Edita el archivo `js/config.js` y cambia esta línea:

```javascript
// Cambiar esta línea:
production: 'https://daytona-backend.onrender.com/api', // Cambiar por tu URL real de Render

// Por tu URL real, por ejemplo:
production: 'https://tu-app.onrender.com/api',
```

### 3. Verificar que funcione
Después de actualizar, verifica que:
- El frontend se conecte correctamente al backend
- Los formularios de turnos funcionen
- El login y registro funcionen

## 🔍 Cómo verificar la conexión:

1. **Abrir la consola del navegador** (F12)
2. **Ir a la pestaña Network**
3. **Intentar hacer una acción** (como cargar turnos)
4. **Verificar que las peticiones vayan a tu URL de Render**

## 📋 URLs que deberías ver en la consola:

```
✅ Correcto: https://tu-app.onrender.com/api/health
✅ Correcto: https://tu-app.onrender.com/api/appointments
❌ Incorrecto: http://localhost:3000/api/health
```

## 🚀 Después de actualizar:

1. **Hacer commit de los cambios**:
   ```bash
   git add js/config.js
   git commit -m "Update Render URL for production"
   git push origin main
   ```

2. **Subir el frontend actualizado** a tu hosting

3. **Probar la funcionalidad completa**:
   - Registro de usuarios
   - Login
   - Creación de turnos
   - Panel de administración

## 🔧 Si tienes problemas:

1. **Verificar que la URL sea correcta** (sin espacios, con https://)
2. **Verificar que el backend esté funcionando** en Render
3. **Revisar la consola del navegador** para errores
4. **Verificar CORS** en el backend

## 📞 Soporte:

Si necesitas ayuda, proporciona:
- La URL de tu aplicación en Render
- Los errores que aparecen en la consola del navegador
- El archivo `js/config.js` actualizado 