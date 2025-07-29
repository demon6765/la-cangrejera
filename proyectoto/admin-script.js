// Script específico para Administrador
let currentUser = null;
let containers = JSON.parse(localStorage.getItem('containers')) || [];
let phase1Data = JSON.parse(localStorage.getItem('phase1Data')) || [];
let phase2Data = JSON.parse(localStorage.getItem('phase2Data')) || [];
let phase3Data = JSON.parse(localStorage.getItem('phase3Data')) || [];
let systemLogs = JSON.parse(localStorage.getItem('systemLogs')) || [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Obtener usuario de la sesión
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        currentUser = userData.username;
        document.getElementById('currentUser').textContent = currentUser;
    } else {
        // Redirigir al login si no hay sesión
        window.location.href = 'index.html';
        return;
    }
    
    // Cargar datos iniciales
    updateAdminDashboard();
    loadSystemLogs();
    updateSystemStats();
}

function updateAdminDashboard() {
    // Actualizar estadísticas del administrador
    const totalRecords = phase1Data.length + phase2Data.length + phase3Data.length;
    const alerts = systemLogs.filter(log => log.type === 'error' || log.type === 'warning').length;
    const deletedData = systemLogs.filter(log => log.action === 'delete').length;
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('alerts').textContent = alerts;
    document.getElementById('deletedData').textContent = deletedData;
    
    // Simular usuarios activos (en un sistema real vendría del backend)
    document.getElementById('activeUsers').textContent = Math.floor(Math.random() * 10) + 5;
}

function updateSystemStats() {
    // Calcular espacio usado
    const dataSize = JSON.stringify(localStorage).length;
    const sizeInKB = (dataSize / 1024).toFixed(2);
    document.getElementById('storageUsed').textContent = `${sizeInKB} KB`;
    
    // Obtener último respaldo
    const lastBackup = localStorage.getItem('lastBackup');
    document.getElementById('lastBackup').textContent = lastBackup || 'Nunca';
    
    // Verificar estado del sistema
    const systemHealth = checkSystemHealth();
    const statusElement = document.getElementById('systemStatus');
    if (systemHealth.isHealthy) {
        statusElement.className = 'badge bg-success';
        statusElement.textContent = 'Operativo';
    } else {
        statusElement.className = 'badge bg-danger';
        statusElement.textContent = 'Problemas Detectados';
    }
}

function loadSystemLogs() {
    const tbody = document.getElementById('systemLogs');
    tbody.innerHTML = '';
    
    // Mostrar los últimos 20 logs
    const recentLogs = systemLogs.slice(-20).reverse();
    
    recentLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString('es-ES')}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.details}</td>
            <td>
                <span class="badge ${getLogBadgeClass(log.type)}">
                    ${log.type}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getLogBadgeClass(type) {
    switch(type) {
        case 'info':
            return 'bg-info';
        case 'success':
            return 'bg-success';
        case 'warning':
            return 'bg-warning';
        case 'error':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function addSystemLog(action, details, type = 'info') {
    const log = {
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: action,
        details: details,
        type: type
    };
    
    systemLogs.push(log);
    localStorage.setItem('systemLogs', JSON.stringify(systemLogs));
    loadSystemLogs();
}

function showData(phase) {
    let data = [];
    let title = '';
    
    switch(phase) {
        case 1:
            data = phase1Data;
            title = 'Datos de Fase 1 - Recepción';
            break;
        case 2:
            data = phase2Data;
            title = 'Datos de Fase 2 - Procesamiento';
            break;
        case 3:
            data = phase3Data;
            title = 'Datos de Fase 3 - Exportación';
            break;
        default:
            data = containers;
            title = 'Todos los Contenedores';
    }
    
    document.getElementById('dataModalTitle').textContent = title;
    
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id || 'N/A'}</td>
            <td>${item.containerNumber || item.containerId || 'N/A'}</td>
            <td>${item.provider || 'N/A'}</td>
            <td>${item.crabType || item.type || 'N/A'}</td>
            <td>${item.weight || item.netWeight || 'N/A'} kg</td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status || item.processStatus || item.shippingStatus)}">
                    ${item.status || item.processStatus || item.shippingStatus || 'N/A'}
                </span>
            </td>
            <td>
                <span class="badge ${getClassificationBadgeClass(item.classification || item.finalQuality)}">
                    ${item.classification || item.finalQuality || 'N/A'}
                </span>
            </td>
            <td>Fase ${item.phase || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('dataModal'));
    modal.show();
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'viva':
        case 'completado':
        case 'entregado':
            return 'bg-success';
        case 'muerta':
        case 'rechazado':
            return 'bg-danger';
        case 'en_proceso':
        case 'en_transito':
            return 'bg-warning';
        default:
            return 'bg-secondary';
    }
}

function getClassificationBadgeClass(classification) {
    switch(classification) {
        case 'A':
            return 'bg-success';
        case 'B':
            return 'bg-warning';
        case 'C':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function generateSystemReport() {
    const report = {
        fecha: new Date().toISOString(),
        administrador: currentUser,
        sistema: {
            version: '1.0.0',
            totalContenedores: containers.length,
            totalRegistros: phase1Data.length + phase2Data.length + phase3Data.length,
            espacioUsado: JSON.stringify(localStorage).length + ' bytes'
        },
        porFase: {
            fase1: phase1Data.length,
            fase2: phase2Data.length,
            fase3: phase3Data.length
        },
        logs: {
            total: systemLogs.length,
            errores: systemLogs.filter(log => log.type === 'error').length,
            advertencias: systemLogs.filter(log => log.type === 'warning').length
        },
        configuracion: {
            sessionTimeout: document.getElementById('sessionTimeout').value,
            maxLoginAttempts: document.getElementById('maxLoginAttempts').value,
            minPasswordLength: document.getElementById('minPasswordLength').value
        }
    };
    
    // Crear archivo de descarga
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_sistema_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    addSystemLog('Generar Reporte', 'Reporte del sistema generado exitosamente', 'success');
    showAlert('Reporte del sistema generado y descargado', 'success');
}

function backupAllData() {
    const backup = {
        containers: containers,
        phase1Data: phase1Data,
        phase2Data: phase2Data,
        phase3Data: phase3Data,
        systemLogs: systemLogs,
        config: {
            sessionTimeout: document.getElementById('sessionTimeout').value,
            maxLoginAttempts: document.getElementById('maxLoginAttempts').value,
            minPasswordLength: document.getElementById('minPasswordLength').value
        },
        timestamp: new Date().toISOString(),
        admin: currentUser
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Guardar fecha del último respaldo
    localStorage.setItem('lastBackup', new Date().toISOString());
    updateSystemStats();
    
    addSystemLog('Respaldo Completo', 'Respaldo completo del sistema realizado', 'success');
    showAlert('Respaldo completo generado exitosamente', 'success');
}

function restoreData() {
    // Crear input file oculto
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (confirm('¿Está seguro de restaurar todos los datos? Esto sobrescribirá los datos actuales.')) {
                        // Restaurar datos
                        if (backup.containers) containers = backup.containers;
                        if (backup.phase1Data) phase1Data = backup.phase1Data;
                        if (backup.phase2Data) phase2Data = backup.phase2Data;
                        if (backup.phase3Data) phase3Data = backup.phase3Data;
                        if (backup.systemLogs) systemLogs = backup.systemLogs;
                        
                        // Guardar en localStorage
                        localStorage.setItem('containers', JSON.stringify(containers));
                        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
                        localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
                        localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
                        localStorage.setItem('systemLogs', JSON.stringify(systemLogs));
                        
                        // Actualizar interfaz
                        updateAdminDashboard();
                        loadSystemLogs();
                        updateSystemStats();
                        
                        addSystemLog('Restaurar Datos', 'Datos restaurados desde backup', 'success');
                        showAlert('Datos restaurados exitosamente', 'success');
                    }
                } catch (error) {
                    addSystemLog('Error Restaurar', 'Error al restaurar datos: ' + error.message, 'error');
                    showAlert('Error al restaurar datos: ' + error.message, 'danger');
                }
            };
            reader.readAsText(file);
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function clearAllData() {
    if (confirm('¿Está seguro de que desea eliminar TODOS los datos del sistema? Esta acción no se puede deshacer.')) {
        if (confirm('Esta es la confirmación final. ¿Realmente desea eliminar todos los datos?')) {
            // Limpiar todos los datos
            localStorage.removeItem('containers');
            localStorage.removeItem('phase1Data');
            localStorage.removeItem('phase2Data');
            localStorage.removeItem('phase3Data');
            localStorage.removeItem('systemLogs');
            
            // Reinicializar variables
            containers = [];
            phase1Data = [];
            phase2Data = [];
            phase3Data = [];
            systemLogs = [];
            
            // Actualizar interfaz
            updateAdminDashboard();
            loadSystemLogs();
            updateSystemStats();
            
            addSystemLog('Limpiar Datos', 'Todos los datos del sistema eliminados', 'warning');
            showAlert('Todos los datos han sido eliminados', 'warning');
        }
    }
}

function exportAllData() {
    const allData = {
        containers: containers,
        phase1Data: phase1Data,
        phase2Data: phase2Data,
        phase3Data: phase3Data,
        systemLogs: systemLogs,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_completo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    addSystemLog('Exportar Datos', 'Exportación completa de datos realizada', 'success');
    showAlert('Exportación completa realizada exitosamente', 'success');
}

function saveSystemConfig() {
    const sessionTimeout = document.getElementById('sessionTimeout').value;
    const maxLoginAttempts = document.getElementById('maxLoginAttempts').value;
    const minPasswordLength = document.getElementById('minPasswordLength').value;
    
    // Guardar configuración
    localStorage.setItem('sessionTimeout', sessionTimeout);
    localStorage.setItem('maxLoginAttempts', maxLoginAttempts);
    localStorage.setItem('minPasswordLength', minPasswordLength);
    
    addSystemLog('Guardar Configuración', 'Configuración del sistema actualizada', 'success');
    showAlert('Configuración guardada exitosamente', 'success');
}

function checkSystemHealth() {
    const health = {
        isHealthy: true,
        issues: []
    };
    
    // Verificar datos críticos
    if (phase1Data.length === 0 && phase2Data.length === 0 && phase3Data.length === 0) {
        health.issues.push('No hay datos en el sistema');
    }
    
    // Verificar logs de error
    const errorLogs = systemLogs.filter(log => log.type === 'error');
    if (errorLogs.length > 5) {
        health.issues.push('Demasiados errores en el sistema');
        health.isHealthy = false;
    }
    
    // Verificar espacio de almacenamiento
    const dataSize = JSON.stringify(localStorage).length;
    if (dataSize > 5 * 1024 * 1024) { // 5MB
        health.issues.push('Almacenamiento casi lleno');
        health.isHealthy = false;
    }
    
    return health;
}

function viewDetails(id) {
    showAlert('Función de vista detallada en desarrollo', 'info');
}

function editItem(id) {
    showAlert('Función de edición en desarrollo', 'info');
}

function deleteItem(id) {
    if (confirm('¿Está seguro de eliminar este elemento?')) {
        // Buscar y eliminar el elemento
        let deleted = false;
        
        // Buscar en phase1Data
        const index1 = phase1Data.findIndex(item => item.id === id);
        if (index1 !== -1) {
            phase1Data.splice(index1, 1);
            deleted = true;
        }
        
        // Buscar en phase2Data
        const index2 = phase2Data.findIndex(item => item.id === id);
        if (index2 !== -1) {
            phase2Data.splice(index2, 1);
            deleted = true;
        }
        
        // Buscar en phase3Data
        const index3 = phase3Data.findIndex(item => item.id === id);
        if (index3 !== -1) {
            phase3Data.splice(index3, 1);
            deleted = true;
        }
        
        if (deleted) {
            // Guardar cambios
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
            localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
            
            addSystemLog('Eliminar Elemento', `Elemento con ID ${id} eliminado`, 'warning');
            showAlert('Elemento eliminado exitosamente', 'success');
            
            // Actualizar dashboard
            updateAdminDashboard();
        } else {
            showAlert('Elemento no encontrado', 'warning');
        }
    }
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

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Funciones de aprobación para el administrador
function openPhase1Review() {
    loadQualityControlTable();
    const modal = new bootstrap.Modal(document.getElementById('phase1ReviewModal'));
    modal.show();
}

function loadQualityControlTable() {
    const tbody = document.getElementById('qualityControlTableBody');
    tbody.innerHTML = '';
    
    // Mostrar todos los contenedores de Fase 1
    phase1Data.forEach(item => {
        const row = document.createElement('tr');
        
        // Determinar el estado de aprobación
        let approvalStatus = '';
        let statusClass = '';
        
        if (item.approvedForProcessing) {
            approvalStatus = '✅ Aprobado';
            statusClass = 'text-success';
        } else if (item.rejected) {
            approvalStatus = '❌ Rechazado';
            statusClass = 'text-danger';
        } else {
            approvalStatus = '⏳ Pendiente';
            statusClass = 'text-warning';
        }
        
        row.innerHTML = `
            <td>${item.containerNumber || item.containerId}</td>
            <td>${item.provider}</td>
            <td>${item.crabType}</td>
            <td>${item.weight} kg</td>
            <td>
                <span class="badge ${item.status === 'viva' ? 'bg-success' : 'bg-danger'}">
                    ${item.status}
                </span>
            </td>
            <td>
                <span class="badge ${getClassificationBadgeClass(item.classification)}">
                    ${item.classification}
                </span>
            </td>
            <td>${new Date(item.date).toLocaleDateString('es-ES')}</td>
            <td class="${statusClass}">${approvalStatus}</td>
            <td>
                ${!item.approvedForProcessing && !item.rejected ? `
                    <button class="btn btn-sm btn-success ms-1" onclick="approveContainer('${item.containerNumber}')" title="Aprobar">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" onclick="rejectContainer('${item.containerNumber}')" title="Rechazar">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function approveContainer(containerNumber) {
    if (confirm(`¿Está seguro de aprobar el contenedor ${containerNumber} para procesamiento?`)) {
        const container = phase1Data.find(item => item.containerNumber === containerNumber);
        if (container) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            addSystemLog('Aprobar Contenedor', `Contenedor ${containerNumber} aprobado por administrador`, 'success');
            showAlert(`Contenedor ${containerNumber} aprobado para procesamiento`, 'success');
            updateAdminDashboard();
        }
    }
}

function rejectContainer(containerNumber) {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (reason) {
        const container = phase1Data.find(item => item.containerNumber === containerNumber);
        if (container) {
            container.rejected = true;
            container.rejectionReason = reason;
            container.rejectedBy = currentUser;
            container.rejectionDate = new Date().toISOString();
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            addSystemLog('Rechazar Contenedor', `Contenedor ${containerNumber} rechazado por administrador. Razón: ${reason}`, 'warning');
            showAlert(`Contenedor ${containerNumber} rechazado`, 'warning');
            updateAdminDashboard();
        }
    }
}

// Exportar funciones para uso global
window.showData = showData;
window.generateSystemReport = generateSystemReport;
window.backupAllData = backupAllData;
window.restoreData = restoreData;
window.clearAllData = clearAllData;
window.exportAllData = exportAllData;
window.saveSystemConfig = saveSystemConfig;
window.checkSystemHealth = checkSystemHealth;
window.viewDetails = viewDetails;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.logout = logout;
window.openPhase1Review = openPhase1Review;
window.approveContainer = approveContainer;
window.rejectContainer = rejectContainer; 