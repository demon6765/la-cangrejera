// Script específico para la página de registro
document.addEventListener('DOMContentLoaded', function() {
    // Configurar formulario de registro
    document.getElementById('newUserForm').addEventListener('submit', handleRegister);
});

// Códigos de seguridad únicos para cada rol (ocultos del usuario)
const SECURITY_CODES = {
    'operador': '1111',
    'supervisor': '1112', 
    'gerente': '1113',
    'admin': '1114'
};

// Función para manejar el registro
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const securityLevel = document.getElementById('newSecurityLevel').value;
    const securityCode = document.getElementById('securityCode').value;
    
    // Validaciones básicas
    if (!username || !password || !confirmPassword || !securityLevel || !securityCode) {
        showAlert('Por favor complete todos los campos', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    if (password.length < 4) {
        showAlert('La contraseña debe tener al menos 4 caracteres', 'danger');
        return;
    }
    
    // Verificar si el usuario ya existe
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userExists = existingUsers.find(user => user.username === username);
    
    if (userExists) {
        showAlert('El nombre de usuario ya existe', 'danger');
        return;
    }
    
    // Validar código de seguridad según el rol
    if (!SECURITY_CODES[securityLevel]) {
        showAlert('Rol de usuario no válido', 'danger');
        return;
    }
    
    if (securityCode !== SECURITY_CODES[securityLevel]) {
        showAlert('Código de seguridad incorrecto. Consulte el código válido en Presidencia.', 'danger');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        username: username,
        password: password, // En producción, esto debería estar encriptado
        securityLevel: securityLevel,
        securityCode: securityCode,
        registrationDate: new Date().toISOString()
    };
    
    // Guardar usuario
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    showAlert('Usuario registrado exitosamente', 'success');
    
    // Limpiar formulario
    document.getElementById('newUserForm').reset();
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function goToLogin() {
    window.location.href = 'index.html';
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