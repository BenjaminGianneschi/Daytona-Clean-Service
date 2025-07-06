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
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: `${name} ${lastname}`,
          email, 
          phone, 
          password 
        })
      });

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
      showAlert('Error de conexión. Inténtalo nuevamente.', 'danger');
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
      const response = await fetch('/api/users/me', {
        credentials: 'include'
      });

      if (response.ok) {
        // Ya está logueado, redirigir
        window.location.href = 'mi-cuenta.html';
      }
    } catch (error) {
      // No está logueado, continuar
    }
  }
}); 