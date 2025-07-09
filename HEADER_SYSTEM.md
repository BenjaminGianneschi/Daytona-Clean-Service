# Sistema de Header Dinámico - Daytona Clean Service

## Descripción

El sistema de header dinámico permite mostrar diferentes contenidos en el header según el estado de autenticación del usuario. Cuando un usuario está logueado, se muestra información personalizada y opciones específicas del usuario.

## Características

### Para Usuarios No Logueados
- Enlaces de navegación estándar
- Botones "Iniciar Sesión" y "Registrarse"
- Botón CTA "Agendar Turno"

### Para Usuarios Logueados
- Avatar personalizado con iniciales del usuario
- Nombre del usuario visible
- Menú dropdown con opciones:
  - **Perfil**: Acceso a la página de mi cuenta
  - **Mis Turnos**: Ver y gestionar turnos
  - **Notificaciones**: Sistema de alertas (en desarrollo)
  - **Ayuda**: Información de contacto y soporte
  - **Cerrar Sesión**: Salir del sistema

## Archivos Involucrados

### JavaScript
- `js/include-header.js` - Script principal que genera el header dinámico
- `js/test-header.js` - Script de prueba para desarrollo

### CSS
- `css/components/header.css` - Estilos específicos del header

### HTML
- Todos los archivos HTML incluyen `<div id="header-container"></div>`
- Todos los archivos HTML incluyen `<script src="js/include-header.js"></script>`

## Funcionamiento

### Verificación de Autenticación
```javascript
const isLoggedIn = localStorage.getItem('token') !== null;
const userData = localStorage.getItem('userData');
```

### Generación del Header
El script `include-header.js` se ejecuta cuando se carga el DOM y:
1. Verifica si existe un token de autenticación
2. Obtiene los datos del usuario del localStorage
3. Genera el HTML apropiado según el estado
4. Inserta el HTML en el contenedor `header-container`

### Datos del Usuario
Los datos del usuario se almacenan en localStorage con la siguiente estructura:
```javascript
{
  id: 1,
  name: "Nombre del Usuario",
  email: "usuario@email.com",
  role: "user"
}
```

## Funciones Disponibles

### Globales
- `logout()` - Cierra la sesión del usuario
- `showNotifications()` - Muestra notificaciones (placeholder)
- `showHelp()` - Muestra información de ayuda

### Desarrollo
- `simulateLogin()` - Simula un usuario logueado para pruebas
- `simulateLogout()` - Simula el logout para pruebas
- `showCurrentState()` - Muestra el estado actual en consola

## Estilos y Animaciones

### Avatar del Usuario
- Círculo con gradiente rojo
- Iniciales del nombre en blanco
- Efecto hover con escala y sombra

### Dropdown Menu
- Animación de entrada suave
- Efectos hover en cada elemento
- Badge animado para notificaciones
- Separadores visuales

### Responsive
- Adaptación para dispositivos móviles
- Menú colapsable en pantallas pequeñas
- Tamaños de avatar ajustados

## Pruebas

Para probar el sistema en desarrollo:

1. Abre la consola del navegador
2. Ejecuta `simulateLogin()` para simular un usuario logueado
3. Ejecuta `simulateLogout()` para simular el logout
4. Usa `showCurrentState()` para ver el estado actual

En modo desarrollo (localhost), aparecerán botones de prueba en la esquina superior derecha.

## Integración con el Backend

El sistema está diseñado para trabajar con:
- Token JWT almacenado en localStorage como 'token'
- Datos del usuario almacenados como 'userData'
- API endpoints de autenticación

## Personalización

### Agregar Nuevas Opciones al Menú
Edita la función `generateHeader()` en `include-header.js` y agrega nuevos elementos al dropdown del usuario.

### Cambiar Estilos
Modifica `css/components/header.css` para personalizar la apariencia.

### Agregar Funcionalidades
Implementa nuevas funciones JavaScript y agrégalas al menú del usuario.

## Notas Técnicas

- El sistema es completamente client-side
- No requiere recarga de página para cambiar estados
- Compatible con todos los navegadores modernos
- Optimizado para rendimiento con CSS y JavaScript eficientes 