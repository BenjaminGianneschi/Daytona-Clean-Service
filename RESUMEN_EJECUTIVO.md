# 🚗 Resumen Ejecutivo - Sistema de Turnos Daytona

## 🎯 ¿Qué es este sistema?

Un sistema completo de gestión de turnos para **Daytona Clean Service** que permite:
- ✅ Reservas online de turnos
- ✅ Panel de administración
- ✅ Notificaciones automáticas por WhatsApp
- ✅ Gestión de múltiples servicios
- ✅ Recordatorios automáticos

## ⚡ Configuración en 3 Pasos

### 1️⃣ Configuración Automática
```bash
chmod +x setup.sh
./setup.sh
```

### 2️⃣ Iniciar Servidor
```bash
./start-server.sh
```

### 3️⃣ Acceder al Sistema
- **Clientes:** http://localhost:3000/turnos.html
- **Admin:** http://localhost:3000/admin/ (admin/admin123)

## 📱 Cómo Usar el Sistema

### Para Clientes (turnos.html)
1. **Seleccionar servicios** → Elegir tipo y cantidad
2. **Elegir fecha/hora** → Ver disponibilidad
3. **Ingresar datos** → Nombre, teléfono, dirección
4. **Confirmar** → Se envía WhatsApp automáticamente

### Para Administradores (Panel Admin)
1. **Ver turnos pendientes** → Dashboard principal
2. **Revisar detalles** → Hacer clic en "Ver"
3. **Confirmar/Cancelar** → Botones en modal
4. **Gestionar configuración** → Horarios, bloqueos, notificaciones

## 🔧 Configuración Importante

### Archivo: `backend/config.env`
```env
# OBLIGATORIO - Cambiar estos valores
DB_PASSWORD=tu_password_mysql
JWT_SECRET=secret_super_seguro_y_unico

# OPCIONAL - Para WhatsApp
WHATSAPP_API_KEY=tu_api_key_whatsapp
```

### Base de Datos
- **Nombre:** `daytona_turnos`
- **Usuario:** `root` (o el que configures)
- **Script:** `backend/database/schema.sql`

## 📊 Servicios Disponibles

### Vehículos
- 🚗 Lavado de Auto ($20.000)
- 🚙 Lavado de SUV ($27.000)
- 🛻 Lavado de Pickup ($25.000)
- ⚙️ Limpieza de Motor ($12.000-$18.000)
- 🪑 Tapizado de Vehículos ($100.000-$125.000)

### Tapizados
- 🛋️ Sillones ($65.000-$150.000)
- 🪑 Sillas ($12.500)
- 🛏️ Colchones ($80.000-$120.000)
- 🧶 Alfombras ($20.000-$35.000)
- 🪑 Puffs ($10.500-$20.000)

## 🔄 Flujo de Trabajo Diario

### Mañana (9:00 AM)
- ✅ Sistema envía recordatorios automáticos
- ✅ Revisar turnos del día en panel admin

### Durante el Día
- ✅ Confirmar turnos pendientes
- ✅ Gestionar cancelaciones si es necesario
- ✅ Monitorear nuevos turnos

### Fin de Día
- ✅ Revisar estadísticas del día
- ✅ Exportar datos si es necesario

## 🚨 Problemas Comunes

### El servidor no inicia
```bash
# Verificar puerto
lsof -i :3000

# Verificar logs
tail -f backend/logs/app.log
```

### No se conecta a la base de datos
```bash
# Verificar MySQL
sudo systemctl status mysql

# Verificar configuración
cat backend/config.env | grep DB_
```

### WhatsApp no funciona
```bash
# Verificar configuración
grep WHATSAPP backend/config.env

# Verificar logs
tail -f backend/logs/app.log | grep whatsapp
```

## 📞 Soporte Rápido

### Contacto
- **WhatsApp:** +5493482588383
- **Email:** benjamin@daytona.com.ar

### Comandos Útiles
```bash
# Iniciar servidor
./start-server.sh

# Detener servidor
./stop-server.sh

# Ver logs en tiempo real
tail -f backend/logs/app.log

# Verificar estado
curl http://localhost:3000/api/health
```

## 📋 Checklist de Producción

Antes de usar en producción:

- [ ] Cambiar `JWT_SECRET` por defecto
- [ ] Configurar `DB_PASSWORD` real
- [ ] Configurar `WHATSAPP_API_KEY` (opcional)
- [ ] Cambiar credenciales admin (`admin/admin123`)
- [ ] Configurar dominio en CORS
- [ ] Configurar HTTPS
- [ ] Configurar backup automático

## 🎯 Próximos Pasos

1. **Configurar el sistema** usando `./setup.sh`
2. **Probar con turnos de prueba**
3. **Configurar WhatsApp** (opcional)
4. **Personalizar mensajes** en panel admin
5. **Configurar horarios** de trabajo
6. **Agregar días bloqueados** (feriados, vacaciones)

---

## 📚 Documentación Completa

- **Guía Detallada:** `GUIA_ADMINISTRACION.md`
- **README Técnico:** `README_TURNOS.md`
- **API Health:** http://localhost:3000/api/health

---

*Sistema desarrollado para optimizar la gestión de turnos de Daytona Clean Service* 