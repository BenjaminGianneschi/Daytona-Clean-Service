# 🔧 Solución para el Problema de Login

## Problema
El panel de administración muestra "Error de conexión" al intentar hacer login.

## Solución

### 1. Verificar que el servidor esté ejecutándose
```bash
cd backend
npm start
```

### 2. Crear el administrador con contraseña correcta
Crea un archivo llamado `fix-admin.js` en el directorio `backend` con este contenido:

```javascript
const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

async function fixAdmin() {
  try {
    console.log('🔧 Arreglando administrador...');
    
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Actualizar o crear administrador
    await query(
      'INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
      ['admin', 'admin@daytona.com.ar', passwordHash, 'Administrador Principal', 'super_admin', passwordHash]
    );
    
    console.log('✅ Administrador arreglado');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdmin();
```

### 3. Ejecutar el script
```bash
cd backend
node fix-admin.js
```

### 4. Probar el login
1. Ve a: http://localhost:3001/admin/
2. Usuario: `admin`
3. Contraseña: `admin123`

## Verificación

### Probar la API directamente:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Respuesta esperada:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@daytona.com.ar",
      "fullName": "Administrador Principal",
      "role": "super_admin"
    }
  }
}
```

## Si el problema persiste

### 1. Verificar la base de datos
```sql
USE daytona_turnos;
SELECT * FROM admins WHERE username = 'admin';
```

### 2. Verificar logs del servidor
```bash
tail -f backend/logs/app.log
```

### 3. Verificar configuración
```bash
cat backend/config.env | grep DB_
```

## Contacto
Si el problema persiste, contacta a:
- WhatsApp: +5493482588383
- Email: benjamin@daytona.com.ar 