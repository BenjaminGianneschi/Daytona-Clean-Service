document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const alertContainer = document.getElementById('alert-container');

  // Verificar si ya está logueado
  checkAuthStatus();

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones
    if (password !== confirmPassword) {
      showAlert('Las contraseñas no coinciden', 'danger');
      return;
    }

    if (password.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
      return;
    }

    try {
      // Usar el servicio de API configurado
      const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: `${name} ${lastname}`,
          email, 
          phone, 
          password 
        })
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta del servidor no es JSON válido');
      }

      const data = await response.json();

      if (data.success) {
        showAlert('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showAlert(data.message || 'Error al crear la cuenta', 'danger');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      if (error.message.includes('JSON')) {
        showAlert('Error en la respuesta del servidor. Verifica la conexión.', 'danger');
      } else {
        showAlert('Error de conexión. Inténtalo nuevamente.', 'danger');
      }
    }
  });

  function showAlert(message, type) {
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  async function checkAuthStatus() {
    try {
      const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
      const response = await fetch(`${apiUrl}/users/me`);

      if (response.ok) {
        // Ya está logueado, redirigir a mi-cuenta.html
        window.location.href = 'mi-cuenta.html';
      }
      // Si no está logueado, simplemente no hace nada y permite el registro
    } catch (error) {
      // No está logueado, continuar en la página de registro
    }
  }
});