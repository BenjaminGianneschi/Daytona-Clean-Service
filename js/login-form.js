// Script para manejar el formulario de login
console.log('🔐 Script de login cargando...');

// Función global para manejar el login (disponible inmediatamente)
window.handleLogin = async function() {
    console.log('🔘 Función handleLogin llamada');
    
    // Verificar que los elementos existan
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        console.error('❌ No se encontró el contenedor de alertas');
        return;
    }
    
    // Función para mostrar alertas
    function showAlert(message, type = 'danger') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    // Función para limpiar alertas
    function clearAlerts() {
        alertContainer.innerHTML = '';
    }

    // Función para mostrar loading
    function showLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
        button.disabled = true;
        return originalText;
    }

    // Función para restaurar botón
    function restoreButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
    
    clearAlerts();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = document.querySelector('.btn-login');
    
    // Validaciones básicas
    if (!email) {
        showAlert('Por favor, ingresa tu email');
        return;
    }
    
    if (!password) {
        showAlert('Por favor, ingresa tu contraseña');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingresa un email válido');
        return;
    }
    
    // Mostrar loading
    const originalButtonText = showLoading(submitButton);
    
    try {
        console.log('🔐 Intentando iniciar sesión...');
        
        // Verificar que getApiUrl esté disponible
        if (typeof getApiUrl !== 'function') {
            throw new Error('getApiUrl no está disponible');
        }
        
        // Llamar a la API de login
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
        
        console.log('📡 Respuesta del servidor:', response.status);
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login exitoso:', data);
            
            // Guardar token en localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role
                }));
            }
            
            // Mostrar mensaje de éxito
            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                window.location.href = 'mi-cuenta.html';
            }, 1000);
            
        } else {
            console.log('❌ Error en login:', data);
            
            // Manejar diferentes tipos de errores
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
        // Restaurar botón
        restoreButton(submitButton, originalButtonText);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 DOM cargado, inicializando login...');
    
    // Agregar atributos autocomplete para mejorar UX
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.setAttribute('autocomplete', 'email');
    }
    
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', 'current-password');
    }
    
    // Verificar que la función getApiUrl esté disponible
    if (typeof getApiUrl !== 'function') {
        console.error('❌ getApiUrl no está disponible');
        return;
    }
    
    console.log('🔐 Script de login cargado correctamente');
    console.log('📡 API URL:', getApiUrl());
}); 