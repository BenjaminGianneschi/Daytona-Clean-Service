// Script para manejar el formulario de login
console.log('🔐 Script de login cargando...');

window.handleLogin = async function() {
    console.log('🔘 Función handleLogin llamada');
    
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        console.error('❌ No se encontró el contenedor de alertas');
        return;
    }
    
    function showAlert(message, type = 'danger') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function clearAlerts() {
        alertContainer.innerHTML = '';
    }

    function showLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
        button.disabled = true;
        return originalText;
    }

    function restoreButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
    
    clearAlerts();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = document.querySelector('.btn-login');
    
    if (!email) {
        showAlert('Por favor, ingresa tu email');
        return;
    }
    if (!password) {
        showAlert('Por favor, ingresa tu contraseña');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingresa un email válido');
        return;
    }
    const originalButtonText = showLoading(submitButton);
    
    try {
        if (typeof getApiUrl !== 'function') {
            throw new Error('getApiUrl no está disponible');
        }
        const response = await fetch(`${getApiUrl()}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Guardar token en localStorage
            if (data.token) {
                console.log('💾 Guardando token en localStorage:', data.token.substring(0, 20) + '...');
                localStorage.setItem('token', data.token); // <-- CLAVE ESTÁNDAR
                localStorage.setItem('userData', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    role: data.user.role
                }));
                console.log('✅ Token guardado correctamente');
            } else {
                console.error('❌ No se recibió token en la respuesta');
            }
            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                console.log('🔄 Redirigiendo a mi-cuenta.html...');
                window.location.href = 'mi-cuenta.html';
            }, 1000);
        } else {
            let errorMessage = 'Error al iniciar sesión';
            if (data.message) {
                errorMessage = data.message;
            } else if (response.status === 401) {
                errorMessage = 'Email o contraseña incorrectos';
            } else if (response.status === 404) {
                errorMessage = 'Usuario no encontrado';
            } else if (response.status === 500) {
                errorMessage = 'Error interno del servidor. Intenta más tarde.';
            }
            showAlert(errorMessage);
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
        let errorMessage = 'Error de conexión. Verifica tu internet.';
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'No se pudo conectar al servidor. Verifica que la API esté funcionando.';
        } else if (error.message.includes('getApiUrl')) {
            errorMessage = 'Error de configuración. Recarga la página.';
        }
        showAlert(errorMessage);
    } finally {
        restoreButton(submitButton, originalButtonText);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 DOM cargado, inicializando login...');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (emailInput) {
        emailInput.setAttribute('autocomplete', 'email');
    }
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', 'current-password');
    }
    if (typeof getApiUrl !== 'function') {
        console.error('❌ getApiUrl no está disponible');
        return;
    }
    console.log('🔐 Script de login cargado correctamente');
    console.log('📡 API URL:', getApiUrl());
});