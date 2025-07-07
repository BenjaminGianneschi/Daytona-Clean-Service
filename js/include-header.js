document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está logueado
  const isLoggedIn = localStorage.getItem('authToken') !== null;
  const userData = localStorage.getItem('userData');
  let user = null;
  
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (e) {
      console.error('Error parseando userData:', e);
    }
  }

  // Generar header dinámico
  const headerHTML = generateHeader(isLoggedIn, user);
  document.getElementById("header-container").innerHTML = headerHTML;
});

function generateHeader(isLoggedIn, user) {
  const baseHeader = `
    <header>
      <nav class="navbar navbar-expand-lg" style="background-color: #1e1e1e;">
        <div class="container">
          <a class="navbar-brand" href="index.html" style="color: #ff3b3f; font-weight: 700;">Daytona Clean Service</a>
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"><i class="fas fa-bars" style="color:#ff3b3f; font-size: 1.3rem;"></i></span>
          </button>
          <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto align-items-lg-center">
              <li class="nav-item">
                <a class="nav-link" href="index.html" style="color: #fff;">Inicio</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html#sobre-nosotros" style="color: #fff;">Sobre Nosotros</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="turnos.html" style="color: #fff;">Agendar Turno</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="serviciosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: #fff;">
                  Servicios
                </a>
                <ul class="dropdown-menu" aria-labelledby="serviciosDropdown" style="background-color: #232323; border: 1px solid #444;">
                  <li><a class="dropdown-item" href="vehiculos.html" style="color: #fff;">Vehículos</a></li>
                  <li><a class="dropdown-item" href="tapizados.html" style="color: #fff;">Tapizados</a></li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="promociones.html" style="color: #fff;">Promociones</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html#contacto" style="color: #fff;">Contacto</a>
              </li>`;

  if (isLoggedIn && user) {
    // Usuario logueado - mostrar menú de usuario
    return baseHeader + `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" style="color: #ff3b3f;">
                  <i class="fas fa-user-circle me-1"></i>${user.name}
                </a>
                <ul class="dropdown-menu" style="background-color: #232323; border: 1px solid #444;">
                  <li><a class="dropdown-item" href="mi-cuenta.html" style="color: #fff;"><i class="fas fa-user me-2"></i>Mi Cuenta</a></li>
                  <li><hr class="dropdown-divider" style="border-color: #444;"></li>
                  <li><a class="dropdown-item" href="#" onclick="logout()" style="color: #fff;"><i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>`;
  } else {
    // Usuario no logueado - mostrar botones de login/registro
    return baseHeader + `
              <li class="nav-item">
                <a class="nav-link" href="login.html" style="color: #fff;">Iniciar Sesión</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="register.html" style="color: #fff;">Registrarse</a>
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
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = 'index.html';
}