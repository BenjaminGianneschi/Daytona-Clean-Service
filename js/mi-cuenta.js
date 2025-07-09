document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Si no hay token, redirige a login
        window.location.href = 'login.html';
        return;
    }
    fetch('http://localhost:3001/api/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Muestra los datos del usuario en la página
            document.getElementById('nombre-usuario').textContent = data.user.name;
            document.getElementById('email-usuario').textContent = data.user.email;
            // ...otros datos que quieras mostrar
        } else {
            // Si el token es inválido, redirige a login
            window.location.href = 'login.html';
        }
    })
    .catch(() => {
        window.location.href = 'login.html';
    });
});