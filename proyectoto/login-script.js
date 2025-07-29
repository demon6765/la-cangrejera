// Script de login para redirigir a páginas específicas
document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulario de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Verificar si hay sesión activa
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        redirectToUserPage(userData.securityLevel);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const securityLevel = document.getElementById('securityLevel').value;
    
    if (!username || !password || !securityLevel) {
        showAlert('Por favor complete todos los campos', 'warning');
        return;
    }
    
    // Verificar credenciales con usuarios registrados
    const user = verifyCredentials(username, password);
    
    if (user) {
        // Verificar que el nivel de seguridad coincida
        if (user.securityLevel === securityLevel) {
            // Guardar sesión
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                securityLevel: securityLevel
            }));
            
            // Redirigir inmediatamente a la página correspondiente
            redirectToUserPage(securityLevel);
        } else {
            showAlert('El nivel de seguridad no coincide con su registro', 'danger');
        }
    } else {
        // Fallback para usuarios no registrados (modo demo)
        if (password.length >= 4) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                securityLevel: securityLevel
            }));
            redirectToUserPage(securityLevel);
        } else {
            showAlert('Credenciales incorrectas o contraseña muy corta', 'danger');
        }
    }
}

function redirectToUserPage(securityLevel) {
    let targetPage = '';
    
    switch(securityLevel) {
        case 'operador':
            targetPage = 'operador.html';
            break;
        case 'supervisor':
            targetPage = 'supervisor.html';
            break;
        case 'gerente':
            targetPage = 'gerente.html';
            break;
        case 'admin':
            targetPage = 'admin.html';
            break;
        default:
            showAlert('Nivel de seguridad no válido', 'danger');
            return;
    }
    
    // Redirigir a la página correspondiente
    window.location.href = targetPage;
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Función para ir a la página de registro
function goToRegister() {
    window.location.href = 'registro.html';
}

// Función para verificar credenciales en el login
function verifyCredentials(username, password) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = registeredUsers.find(u => u.username === username && u.password === password);
    return user;
} 