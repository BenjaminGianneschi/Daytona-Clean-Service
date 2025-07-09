document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Verificando autenticación en mi-cuenta...');
    
    const token = localStorage.getItem('token');
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
        console.log('❌ No hay token, redirigiendo a login...');
        window.location.href = 'login.html';
        return;
    }
    
    const apiUrl = window.getApiUrl ? window.getApiUrl() : 'https://daytona-clean-service.onrender.com/api';
    console.log('📡 API URL:', apiUrl);
    
    fetch(`${apiUrl}/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        console.log('📊 Status de respuesta:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('📋 Datos recibidos:', data);
        
        if (data.success) {
            console.log('✅ Usuario autenticado correctamente');
            // Muestra los datos del usuario en la página
            const nombreElement = document.getElementById('nombre-usuario');
            const emailElement = document.getElementById('email-usuario');
            
            if (nombreElement) nombreElement.textContent = data.user.name;
            if (emailElement) emailElement.textContent = data.user.email;
            
            // Mostrar información del usuario
            console.log('👤 Usuario:', data.user.name);
            console.log('📧 Email:', data.user.email);
            console.log('👑 Rol:', data.user.role);
        } else {
            console.log('❌ Token inválido, redirigiendo a login...');
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        console.error('❌ Error en verificación:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    });
});