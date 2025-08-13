// Función para incluir el header
function includeHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  // Verificar si el usuario está logueado
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  // Usar userData como fallback si userInfo no tiene datos
  const user = userInfo.name ? userInfo : userData;
  const isLoggedIn = token && (user.name || user.email);
  const isAdmin = user && user.role === 'admin';

  let headerHTML = `
    <header>
      <nav class="navbar navbar-expand-lg" style="background-color: #1e1e1e;">
        <div class="container" style="padding-left: 0;">
          <a class="navbar-brand" href="index.html" style="color: #ff3b3f; font-weight: 700; font-size: 1.3rem; margin-right: 0; padding-left: 0; margin-left: 0;">
            Daytona Clean Service
          </a>
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"><i class="fas fa-bars" style="color:#ff3b3f; font-size: 1.3rem;"></i></span>
          </button>
          <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto align-items-lg-center" style="gap: 8px;">
              <li class="nav-item">
                <a class="nav-link" href="index.html#sobre-nosotros" style="color: #fff;">Sobre Nosotros</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="serviciosDropdown" role="button" data-bs-toggle="dropdown"
                  aria-expanded="false" style="color: #fff;">
                  Servicios
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="serviciosDropdown"
                  style="background-color: #222; border: none; min-width: 180px;">
                  <li><a class="dropdown-item" href="vehiculos.html">Vehículos</a></li>
                  <li><a class="dropdown-item" href="tapizados.html">Tapizados</a></li>
                </ul>
              </li>

              <li class="nav-item">
                <a class="nav-link" href="index.html#contacto" style="color: #fff;">Contacto</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="ayuda.html" style="color: #fff;">Ayuda</a>
              </li>
  `;

  if (isLoggedIn) {
    // Usuario logueado - mostrar menú de usuario
    const userName = user.name || user.email || 'Usuario';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    
    headerHTML += `
              ${isAdmin ? '<li class="nav-item"><a class="nav-link" href="promociones.html" style="color: #fff;">Promociones</a></li>' : ''}
              <!-- Separador visual -->
              <li class="nav-item" style="width: 1px; height: 25px; background: #444; margin: 0 10px; align-self: center;"></li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown"
                  aria-expanded="false" style="color: #fff;">
                  <i class="fas fa-user-circle me-1"></i>
                  ${userInitials} ${userName}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown"
                  style="background-color: #222; border: none; min-width: 200px;">
                  <li><a class="dropdown-item" href="mi-cuenta.html"><i class="fas fa-user me-2"></i>Mi Cuenta</a></li>
                  <li><a class="dropdown-item" href="notifications.html">
                    <i class="fas fa-bell me-2"></i>Notificaciones
                    <span class="badge bg-danger notification-badge ms-2" style="display: none;">0</span>
                  </a></li>
                  <li><a class="dropdown-item" href="turnos.html" style="background: linear-gradient(135deg, #731013 0%, #1a1a1a 100%) !important; border: none !important; color: #ffffff !important; font-weight: 600; margin: 5px 10px; border-radius: 6px; transform: translateY(-1px);">
                    <i class="fas fa-calendar-plus me-2"></i>Agendar Turno
                  </a></li>
                  ${isAdmin ? '<li><a class="dropdown-item" href="mi-cuenta.html#gestion-turnos"><i class="fas fa-cogs me-2"></i>Gestión de Turnos</a></li>' : ''}
                  <li><hr class="dropdown-divider" style="border-color: #444;"></li>
                  <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión</a></li>
                </ul>
              </li>
    `;
  } else {
    // Usuario no logueado - mostrar botones de login/register
    headerHTML += `
              <!-- Separador visual -->
              <li class="nav-item" style="width: 1px; height: 25px; background: #444; margin: 0 10px; align-self: center;"></li>
              <li class="nav-item">
                <a class="nav-link" href="login.html" style="color: #fff;">
                  <i class="fas fa-sign-in-alt me-1"></i>Iniciar Sesión
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="register.html" style="color: #fff;">
                  <i class="fas fa-user-plus me-1"></i>Registrarse
                </a>
              </li>
              <li class="nav-item ms-lg-2">
                <a class="btn" href="turnos.html" style="background: linear-gradient(135deg, #731013 0%, #1a1a1a 100%) !important; border: none !important; color: #ffffff !important; font-weight: 600; border-radius: 8px; padding: 8px 18px; transition: all 0.3s ease; transform: translateY(-1px);">
                  <i class="fas fa-calendar-plus me-1"></i>Agendar Turno
                </a>
              </li>
    `;
  }
  
  headerHTML += `
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `;

  headerContainer.innerHTML = headerHTML;

  // Si el usuario está logueado, cargar el contador de notificaciones
  if (isLoggedIn) {
    loadNotificationCount();
  }
}

// Función para cargar el contador de notificaciones
async function loadNotificationCount() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('https://daytona-clean-service.onrender.com/api/notifications/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      const notificationBadge = document.querySelector('.notification-badge');
      if (notificationBadge) {
        notificationBadge.textContent = data.count;
        notificationBadge.style.display = data.count > 0 ? 'inline' : 'none';
      }
    }
  } catch (error) {
    console.error('Error cargando contador de notificaciones:', error);
  }
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  window.location.href = '/index.html';
}

// Función para mostrar alertas
function showAlert(message, type = 'info', duration = 3000) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  if (duration > 0) {
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, duration);
  }
}

// Incluir el header cuando se carga la página
document.addEventListener('DOMContentLoaded', includeHeader);

// Estilos para el header
const headerStyles = `
<style>
/* Header fijo para evitar superposición */
header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  width: 100% !important;
}

/* Espaciado global para body cuando hay header fijo */
body {
  padding-top: 80px !important;
}

/* Efectos hover para los enlaces */
.navbar-nav .nav-link:hover {
  color: #ff3b3f !important;
  background-color: rgba(255, 59, 63, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* Efecto hover para el botón CTA */
.navbar-nav .btn:hover {
  background: linear-gradient(45deg, #b31217, #ff3b3f) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 59, 63, 0.3);
}

/* Estilos para el dropdown de usuario */
.dropdown-menu {
  background-color: #222 !important;
  border: 1px solid #444 !important;
}

.dropdown-item {
  color: #fff !important;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 59, 63, 0.2) !important;
  color: #ff3b3f !important;
}

.dropdown-divider {
  border-color: #444 !important;
}

/* Badge de notificaciones */
.notification-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .navbar-nav {
    gap: 5px !important;
    margin-top: 15px;
  }
  
  .nav-item {
    margin-bottom: 3px;
  }
}
</style>
`;

// Agregar estilos al head
document.head.insertAdjacentHTML('beforeend', headerStyles);