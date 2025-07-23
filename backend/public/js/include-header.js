document.addEventListener("DOMContentLoaded", () => {
  console.log('🔄 include-header.js: DOM cargado, generando header...');
  
  // Verificar si el usuario está logueado
  const isLoggedIn = localStorage.getItem('token') !== null;
  const userData = localStorage.getItem('userData');
  let user = null;
  
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error('Error parseando userData:', e);
    }
  }

  // Verificar si es admin
  const isAdmin = user && user.role === 'admin';

  console.log('🔄 include-header.js: Usuario logueado:', isLoggedIn, user, 'Admin:', isAdmin);

  // Generar header dinámico
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    const headerHTML = generateHeader(isLoggedIn, user);
    headerContainer.innerHTML = headerHTML;
    console.log('✅ include-header.js: Header generado correctamente');
    
    // Inicializar dropdowns después de generar el header
    setTimeout(() => {
      if (typeof bootstrap !== 'undefined') {
        var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
        var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
          return new bootstrap.Dropdown(dropdownToggleEl);
        });
        console.log('✅ include-header.js: Dropdowns inicializados');
      } else {
        console.warn('⚠️ include-header.js: Bootstrap no está disponible');
      }
    }, 50);
  } else {
    console.error('❌ include-header.js: No se encontró header-container');
  }
});

function generateHeader(isLoggedIn, user) {
  const baseHeader = `
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
                <a class="nav-link" href="index.html#ubicacion" style="color: #fff;">Ubicación</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html#contacto" style="color: #fff;">Contacto</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="promociones.html" style="color: #fff;">Promociones</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="ayuda.html" style="color: #fff;">Ayuda</a>
              </li>`;

  if (isLoggedIn && user) {
    // Usuario logueado - mostrar menú de usuario profesional
    const userName = user.name || 'Usuario';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const isAdmin = user.role === 'admin';
    
    return baseHeader + `
              <!-- Separador visual -->
              <li class="nav-item" style="width: 1px; height: 25px; background: #444; margin: 0 10px; align-self: center;"></li>
              <!-- Menú de usuario -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: #ff3b3f; font-weight: 500;">
                  <div class="user-avatar me-2" style="width: 32px; height: 32px; background: linear-gradient(45deg, #ff3b3f, #b31217); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                    ${userInitials}
                  </div>
                  <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userName}</span>
                  <i class="fas fa-chevron-down ms-1" style="font-size: 10px;"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" style="background-color: #222; border: 1px solid #444; min-width: 220px; margin-top: 8px;">
                  <li class="dropdown-header" style="color: #ff3b3f; font-weight: 600; padding: 8px 16px; border-bottom: 1px solid #444;">
                    <i class="fas fa-user-circle me-2"></i>Mi Cuenta
                  </li>
                  <li><a class="dropdown-item" href="mi-cuenta.html" style="color: #fff; padding: 10px 16px;">
                    <i class="fas fa-user me-2" style="width: 16px;"></i>Perfil
                  </a></li>
                  <li><a class="dropdown-item" href="${isAdmin ? 'mi-cuenta.html#gestion-turnos' : (window.location.pathname.includes('mi-cuenta.html') ? '#turnos-activos' : 'mi-cuenta.html#turnos-activos')}" style="color: #fff; padding: 10px 16px;">
                    <i class="fas fa-calendar-alt me-2" style="width: 16px;"></i>${isAdmin ? 'Gestión' : 'Mis Turnos'}
                  </a></li>
                  <li><a class="dropdown-item" href="#" onclick="showNotifications()" style="color: #fff; padding: 10px 16px;">
                    <i class="fas fa-bell me-2" style="width: 16px;"></i>Notificaciones
                    <span class="badge bg-danger ms-2" style="font-size: 10px;">2</span>
                  </a></li>
                  <li><hr class="dropdown-divider" style="border-color: #444; margin: 8px 0;"></li>
                  <li><a class="dropdown-item" href="#" onclick="showHelp()" style="color: #fff; padding: 10px 16px;">
                    <i class="fas fa-question-circle me-2" style="width: 16px;"></i>Ayuda
                  </a></li>
                  <li><a class="dropdown-item" href="#" onclick="logout()" style="color: #ff6b6b; padding: 10px 16px;">
                    <i class="fas fa-sign-out-alt me-2" style="width: 16px;"></i>Cerrar Sesión
                  </a></li>
                </ul>
              </li>
              <li class="nav-item ms-lg-2">
                <a class="btn" href="turnos.html" style="background: linear-gradient(45deg, #ff3b3f, #b31217); color: #fff; font-weight: 600; border-radius: 8px; padding: 8px 18px; border: none; transition: all 0.3s ease;">
                  <i class="fas fa-calendar-plus me-1"></i>Agendar Turno
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>`;
  } else {
    // Usuario no logueado - mostrar botones de login/registro
    return baseHeader + `
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
                <a class="btn" href="turnos.html" style="background: linear-gradient(45deg, #ff3b3f, #b31217); color: #fff; font-weight: 600; border-radius: 8px; padding: 8px 18px; border: none; transition: all 0.3s ease;">
                  <i class="fas fa-calendar-plus me-1"></i>Agendar Turno
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>`;
  }
}

// Función global para logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  window.location.href = 'index.html';
}

// Función para mostrar notificaciones
function showNotifications() {
  alert('Sistema de notificaciones en desarrollo. Próximamente podrás ver tus recordatorios de turnos aquí.');
}

// Función para mostrar ayuda
function showHelp() {
  window.location.href = 'ayuda.html';
}