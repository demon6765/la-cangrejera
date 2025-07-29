// Script específico para Gerente de Proceso
let currentUser = null;
let containers = JSON.parse(localStorage.getItem('containers')) || [];
let phase1Data = JSON.parse(localStorage.getItem('phase1Data')) || [];
let phase2Data = JSON.parse(localStorage.getItem('phase2Data')) || [];
let phase3Data = JSON.parse(localStorage.getItem('phase3Data')) || [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeGerente();
});

function initializeGerente() {
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
    updateGerenteDashboard();
    updateSystemStats();
}

function updateGerenteDashboard() {
    // Actualizar estadísticas del gerente
    document.getElementById('totalContainers').textContent = containers.length;
    
    const claseA = containers.filter(c => c.classification === 'A').length;
    const claseB = containers.filter(c => c.classification === 'B').length;
    const claseC = containers.filter(c => c.classification === 'C').length;
    
    document.getElementById('claseA').textContent = claseA;
    document.getElementById('claseB').textContent = claseB;
    document.getElementById('claseC').textContent = claseC;
}

function updateSystemStats() {
    // Actualizar estadísticas del sistema
    document.getElementById('phase1Count').textContent = phase1Data.length;
    document.getElementById('phase2Count').textContent = phase2Data.length;
    document.getElementById('phase3Count').textContent = phase3Data.length;
    document.getElementById('totalExported').textContent = phase3Data.filter(item => item.shippingStatus === 'entregado').length;
    
    // Estadísticas de aprobación
    const approved = phase1Data.filter(item => item.approvedForProcessing).length;
    const rejected = phase1Data.filter(item => item.rejected).length;
    const pending = phase1Data.length - approved - rejected;
    
    const approvedElement = document.getElementById('approvedCount');
    const rejectedElement = document.getElementById('rejectedCount');
    const pendingElement = document.getElementById('pendingCount');
    
    if (approvedElement) approvedElement.textContent = approved;
    if (rejectedElement) rejectedElement.textContent = rejected;
    if (pendingElement) pendingElement.textContent = pending;
}

// Funciones de aprobación para el gerente
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

function openPhase1() {
    showData(1);
}

function openPhase2() {
    showData(2);
}

function openPhase3() {
    // Mostrar contenedores procesados para exportación
    const processedContainers = phase2Data.filter(item => item.processStatus === 'completado');
    
    if (processedContainers.length === 0) {
        showAlert('No hay contenedores procesados disponibles para exportar', 'warning');
        return;
    }
    
    // Crear selector de contenedores
    const containerSelect = document.createElement('select');
    containerSelect.className = 'form-select form-control-custom mb-3';
    containerSelect.id = 'containerSelect3';
    
    containerSelect.innerHTML = '<option value="">Seleccionar contenedor</option>';
    processedContainers.forEach(container => {
        containerSelect.innerHTML += `<option value="${container.containerId}">${container.containerId} - ${container.finalQuality}</option>`;
    });
    
    // Reemplazar campo de contenedor ID
    const containerIdField = document.getElementById('containerId3');
    containerIdField.parentNode.insertBefore(containerSelect, containerIdField);
    containerIdField.style.display = 'none';
    
    // Configurar evento de selección
    containerSelect.addEventListener('change', function() {
        if (this.value) {
            containerIdField.value = this.value;
        }
    });
    
    // Limpiar formulario
    document.getElementById('phase3Form').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('phase3Modal'));
    modal.show();
}

function savePhase3() {
    const form = document.getElementById('phase3Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = {
        id: Date.now(),
        containerId: document.getElementById('containerId3').value,
        packagingType: document.getElementById('packagingType').value,
        netWeight: parseFloat(document.getElementById('netWeight').value),
        packageCount: parseInt(document.getElementById('packageCount').value),
        destination: document.getElementById('destination').value,
        shippingDate: document.getElementById('shippingDate').value,
        transportMethod: document.getElementById('transportMethod').value,
        shippingStatus: document.getElementById('shippingStatus').value,
        shippingNotes: document.getElementById('shippingNotes').value,
        phase: 3,
        date: new Date().toISOString(),
        operator: currentUser
    };
    
    // Guardar datos
    phase3Data.push(data);
    
    // Actualizar contenedor en la lista principal
    const containerIndex = containers.findIndex(c => c.containerNumber === data.containerId);
    if (containerIndex !== -1) {
        containers[containerIndex].phase = 3;
        containers[containerIndex].shippingStatus = data.shippingStatus;
    }
    
    // Persistir en localStorage
    localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
    localStorage.setItem('containers', JSON.stringify(containers));
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase3Modal')).hide();
    updateGerenteDashboard();
    updateSystemStats();
    
    showAlert('Datos de exportación guardados exitosamente', 'success');
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
                ${phase === 1 && !item.approvedForProcessing && !item.rejected ? `
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

function generateReport() {
    const report = {
        fecha: new Date().toISOString(),
        totalContenedores: containers.length,
        porFase: {
            fase1: containers.filter(c => c.phase === 1).length,
            fase2: containers.filter(c => c.phase === 2).length,
            fase3: containers.filter(c => c.phase === 3).length
        },
        porClasificacion: {
            claseA: containers.filter(c => c.classification === 'A').length,
            claseB: containers.filter(c => c.classification === 'B').length,
            claseC: containers.filter(c => c.classification === 'C').length
        },
        rechazados: phase1Data.filter(d => d.rejected).length,
        exportados: phase3Data.filter(d => d.shippingStatus === 'entregado').length
    };
    
    // Crear archivo de descarga
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_gerente_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Reporte generado y descargado', 'success');
}

function backupData() {
    const backup = {
        containers: containers,
        phase1Data: phase1Data,
        phase2Data: phase2Data,
        phase3Data: phase3Data,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_gerente_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Respaldo generado exitosamente', 'success');
}

function viewDetails(id) {
    showAlert('Función de vista detallada en desarrollo', 'info');
}

function editItem(id) {
    showAlert('Función de edición en desarrollo', 'info');
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

// Funciones de aprobación para gerente
function approveContainer(containerNumber) {
    if (confirm(`¿Está seguro de aprobar el contenedor ${containerNumber} para procesamiento?`)) {
        const container = phase1Data.find(item => item.containerNumber === containerNumber);
        if (container) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            showAlert(`Contenedor ${containerNumber} aprobado para procesamiento`, 'success');
            updateSystemStats();
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
            showAlert(`Contenedor ${containerNumber} rechazado`, 'warning');
            updateSystemStats();
        }
    }
}

function bulkApprove() {
    const pendingContainers = phase1Data.filter(item => !item.approvedForProcessing && !item.rejected);
    if (pendingContainers.length === 0) {
        showAlert('No hay contenedores pendientes de aprobación', 'info');
        return;
    }
    
    if (confirm(`¿Está seguro de aprobar ${pendingContainers.length} contenedores pendientes?`)) {
        pendingContainers.forEach(container => {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
        });
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        showAlert(`${pendingContainers.length} contenedores aprobados en lote`, 'success');
        updateSystemStats();
    }
}

// Exportar funciones para uso global
window.openPhase1 = openPhase1;
window.openPhase2 = openPhase2;
window.openPhase3 = openPhase3;
window.savePhase3 = savePhase3;
window.showData = showData;
window.generateReport = generateReport;
window.backupData = backupData;
window.viewDetails = viewDetails;
window.editItem = editItem;
window.logout = logout;
window.openPhase1Review = openPhase1Review;
window.approveContainer = approveContainer;
window.rejectContainer = rejectContainer;
window.bulkApprove = bulkApprove; 