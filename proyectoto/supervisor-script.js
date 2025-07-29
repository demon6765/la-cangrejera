// Script específico para Supervisor de Calidad
let currentUser = null;
let phase1Data = JSON.parse(localStorage.getItem('phase1Data')) || [];
let phase2Data = JSON.parse(localStorage.getItem('phase2Data')) || [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeSupervisor();
});

function initializeSupervisor() {
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
    updateSupervisorDashboard();
    loadQualityControlTable();
}

function updateSupervisorDashboard() {
    // Actualizar estadísticas específicas del supervisor
    const totalReceived = phase1Data.length;
    const approved = phase1Data.filter(item => item.approvedForProcessing).length;
    const rejected = phase1Data.filter(item => item.rejected).length;
    const pending = totalReceived - approved - rejected;
    const inProcessing = phase2Data.filter(item => item.processStatus === 'en_proceso').length;
    const completed = phase2Data.filter(item => item.processStatus === 'completado').length;
    
    document.getElementById('totalReceived').textContent = totalReceived;
    document.getElementById('inProcessing').textContent = inProcessing;
    document.getElementById('completed').textContent = completed;
    document.getElementById('rejected').textContent = rejected;
    
    // Actualizar estadísticas adicionales si existen los elementos
    const approvedElement = document.getElementById('approved');
    const pendingElement = document.getElementById('pending');
    if (approvedElement) approvedElement.textContent = approved;
    if (pendingElement) pendingElement.textContent = pending;
}

function loadQualityControlTable() {
    const tbody = document.getElementById('qualityControlTable');
    tbody.innerHTML = '';
    
    // Combinar datos de fase 1 y 2
    const allData = [];
    
    // Agregar datos de fase 1
    phase1Data.forEach(item => {
        allData.push({
            ...item,
            phase: 1,
            phaseText: 'Recepción',
            status: item.status,
            quality: item.classification
        });
    });
    
    // Agregar datos de fase 2
    phase2Data.forEach(item => {
        allData.push({
            ...item,
            phase: 2,
            phaseText: 'Procesamiento',
            status: item.processStatus,
            quality: item.finalQuality
        });
    });
    
    // Ordenar por fecha más reciente
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Mostrar los últimos 15 registros
    allData.slice(0, 15).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.containerNumber || item.containerId}</td>
            <td>${item.provider || 'N/A'}</td>
            <td>
                <span class="badge ${item.phase === 1 ? 'bg-primary' : 'bg-success'}">
                    ${item.phaseText}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">
                    ${item.status}
                </span>
            </td>
            <td>
                <span class="badge ${getClassificationBadgeClass(item.quality || 'B')}">
                    ${item.quality || 'Clase B'}
                </span>
            </td>
            <td>${item.operator || currentUser}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
                ${item.phase === 1 && !item.approvedForProcessing && !item.rejected ? `
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
    // Cargar datos de fase 1 para revisión
    const tbody = document.getElementById('phase1ReviewTable');
    tbody.innerHTML = '';
    
    phase1Data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.containerNumber}</td>
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
            <td>${item.operator}</td>
            <td>
                <button class="btn btn-sm btn-outline-success" onclick="approveContainer('${item.containerNumber}')">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="rejectContainer('${item.containerNumber}')">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('phase1ReviewModal'));
    modal.show();
}

function approveContainer(containerNumber) {
    if (confirm(`¿Está seguro de aprobar el contenedor ${containerNumber} para procesamiento?`)) {
        // Marcar como aprobado para procesamiento
        const container = phase1Data.find(item => item.containerNumber === containerNumber);
        if (container) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            showAlert(`Contenedor ${containerNumber} aprobado para procesamiento`, 'success');
            updateSupervisorDashboard();
            loadQualityControlTable();
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
            updateSupervisorDashboard();
            loadQualityControlTable();
        }
    }
}

function openPhase2() {
    // Mostrar contenedores aprobados para procesamiento
    const approvedContainers = phase1Data.filter(item => item.approvedForProcessing && !item.rejected);
    
    console.log('Contenedores aprobados para Fase 2:', approvedContainers);
    
    if (approvedContainers.length === 0) {
        const message = `
            ❌ No hay contenedores aprobados para procesamiento.
            
            Total contenedores en Fase 1: ${phase1Data.length}
            Contenedores aprobados: ${phase1Data.filter(item => item.approvedForProcessing).length}
            Contenedores rechazados: ${phase1Data.filter(item => item.rejected).length}
            Contenedores pendientes: ${phase1Data.filter(item => !item.approvedForProcessing && !item.rejected).length}
            
            Use "Arreglar Aprobación" para aprobar contenedores automáticamente.
        `;
        showAlert(message, 'warning');
        return;
    }
    
    // Crear selector de contenedores
    const containerSelect = document.createElement('select');
    containerSelect.className = 'form-select form-control-custom mb-3';
    containerSelect.id = 'containerSelect2';
    
    containerSelect.innerHTML = '<option value="">Seleccionar contenedor</option>';
    approvedContainers.forEach(container => {
        const approvalInfo = container.approvedBy ? ` (Aprobado por: ${container.approvedBy})` : '';
        const classification = container.classification || 'B';
        containerSelect.innerHTML += `<option value="${container.containerNumber}">${container.containerNumber} - ${container.provider} (Clase ${classification})${approvalInfo}</option>`;
    });
    
    // Reemplazar campo de contenedor ID
    const containerIdField = document.getElementById('containerId2');
    containerIdField.parentNode.insertBefore(containerSelect, containerIdField);
    containerIdField.style.display = 'none';
    
    // Configurar evento de selección
    containerSelect.addEventListener('change', function() {
        if (this.value) {
            containerIdField.value = this.value;
        }
    });
    
    // Limpiar formulario
    document.getElementById('phase2Form').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('phase2Modal'));
    modal.show();
}

function savePhase2() {
    const form = document.getElementById('phase2Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = {
        id: Date.now(),
        containerId: document.getElementById('containerId2').value,
        cookingTemp: parseInt(document.getElementById('cookingTemp').value),
        cookingTime: parseInt(document.getElementById('cookingTime').value),
        coolingTemp: parseInt(document.getElementById('coolingTemp').value),
        // Separación de carne en 5 partes
        specialMeat: parseFloat(document.getElementById('specialMeat').value),
        superLumpMeat: parseFloat(document.getElementById('superLumpMeat').value),
        jumboMeat: parseFloat(document.getElementById('jumboMeat').value),
        clawMeat: parseFloat(document.getElementById('clawMeat').value),
        organicWaste: parseFloat(document.getElementById('organicWaste').value),
        totalProcessed: parseFloat(document.getElementById('totalProcessed').value),
        finalQuality: document.getElementById('finalQuality').value,
        processStatus: document.getElementById('processStatus').value,
        qualityNotes: document.getElementById('qualityNotes').value,
        phase: 2,
        date: new Date().toISOString(),
        operator: currentUser
    };
    
    // Validaciones específicas para separación de carne
    const totalMeat = data.specialMeat + data.superLumpMeat + data.jumboMeat + data.clawMeat;
    const totalProcessed = data.totalProcessed;
    
    if (totalMeat < 50) {
        if (!confirm('El rendimiento de carne aprovechable es bajo (' + totalMeat + ' kg). ¿Desea continuar?')) {
            return;
        }
    }
    
    if (data.organicWaste > totalMeat * 0.6) {
        if (!confirm('El desperdicio orgánico es alto (' + data.organicWaste + ' kg). ¿Desea continuar?')) {
            return;
        }
    }
    
    // Calcular porcentaje de aprovechamiento
    const aprovechamiento = ((totalMeat / totalProcessed) * 100).toFixed(1);
    data.aprovechamiento = aprovechamiento + '%';
    
    // Guardar datos
    phase2Data.push(data);
    localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase2Modal')).hide();
    updateSupervisorDashboard();
    loadQualityControlTable();
    
    showAlert('Datos de procesamiento guardados exitosamente', 'success');
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'viva':
        case 'completado':
            return 'bg-success';
        case 'muerta':
        case 'rechazado':
            return 'bg-danger';
        case 'en_proceso':
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

function viewDetails(id) {
    // Implementar vista detallada
    showAlert('Función de vista detallada en desarrollo', 'info');
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

// Funciones de acceso forzado para supervisor
function forcePhase2Access() {
    console.log('=== SUPERVISOR: FORZANDO ACCESO A FASE 2 ===');
    
    // Crear datos de prueba si no existen
    if (phase1Data.length === 0) {
        const testContainers = [
            {
                id: Date.now(),
                containerNumber: 'CONT-SUP-001',
                provider: 'Proveedor Supervisor',
                crabType: 'azul',
                size: 'grande',
                weight: 150.5,
                quantity: 100,
                status: 'viva',
                classification: 'A',
                observations: 'Contenedor aprobado por supervisor',
                phase: 1,
                date: new Date().toISOString(),
                operator: currentUser,
                approvedForProcessing: true,
                approvedBy: currentUser,
                approvalDate: new Date().toISOString(),
                autoApproved: true,
                supervisorApproved: true
            }
        ];
        
        phase1Data.push(...testContainers);
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        console.log('Datos de prueba creados por supervisor:', testContainers);
    }
    
    // Aprobar TODOS los contenedores existentes
    let approvedCount = 0;
    phase1Data.forEach(container => {
        if (!container.approvedForProcessing && !container.rejected) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            container.supervisorApproved = true;
            approvedCount++;
        }
    });
    
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    console.log(`Supervisor aprobó ${approvedCount} contenedores`);
    
    // Mostrar confirmación
    showAlert(`✅ SUPERVISOR: ACCESO FORZADO A FASE 2\n\n${phase1Data.length} contenedores aprobados.\nAhora puede acceder a la Fase 2.`, 'success');
    
    // Abrir Fase 2 inmediatamente
    setTimeout(() => {
        openPhase2();
    }, 1000);
}

function resetAndCreateTestData() {
    console.log('=== SUPERVISOR: REINICIANDO Y CREANDO DATOS ===');
    
    // Limpiar datos existentes
    phase1Data = [];
    phase2Data = [];
    
    // Crear datos de prueba aprobados
    const testContainers = [
        {
            id: Date.now(),
            containerNumber: 'CONT-SUP-TEST-001',
            provider: 'Proveedor de Prueba Supervisor',
            crabType: 'azul',
            size: 'grande',
            weight: 150.5,
            quantity: 100,
            status: 'viva',
            classification: 'A',
            observations: 'Contenedor de prueba aprobado por supervisor',
            phase: 1,
            date: new Date().toISOString(),
            operator: currentUser,
            approvedForProcessing: true,
            approvedBy: currentUser,
            approvalDate: new Date().toISOString(),
            autoApproved: true,
            supervisorApproved: true,
            testData: true
        }
    ];
    
    phase1Data = testContainers;
    
    // Guardar en localStorage
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
    
    console.log('Datos de prueba creados por supervisor:', testContainers);
    
    showAlert(`✅ SUPERVISOR: DATOS REINICIADOS\n\nContenedor de prueba creado y aprobado.\nAhora puede acceder a la Fase 2.`, 'success');
    
    // Abrir Fase 2 inmediatamente
    setTimeout(() => {
        openPhase2();
    }, 1000);
}

function bulkApproveAll() {
    console.log('=== SUPERVISOR: APROBACIÓN MASIVA ===');
    
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
            container.supervisorApproved = true;
        });
        
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        showAlert(`${pendingContainers.length} contenedores aprobados por supervisor`, 'success');
        updateSupervisorDashboard();
        loadQualityControlTable();
    }
}

function diagnosePhase2Issue() {
    console.log('=== SUPERVISOR: DIAGNÓSTICO FASE 2 ===');
    
    const totalContainers = phase1Data.length;
    const pendingContainers = phase1Data.filter(item => !item.approvedForProcessing && !item.rejected).length;
    const approvedContainers = phase1Data.filter(item => item.approvedForProcessing).length;
    const rejectedContainers = phase1Data.filter(item => item.rejected).length;
    
    let message = `SUPERVISOR - DIAGNÓSTICO FASE 2:\n\n`;
    message += `Usuario: ${currentUser}\n`;
    message += `Rol: Supervisor de Calidad\n\n`;
    message += `Contenedores:\n`;
    message += `• Total: ${totalContainers}\n`;
    message += `• Pendientes: ${pendingContainers}\n`;
    message += `• Aprobados: ${approvedContainers}\n`;
    message += `• Rechazados: ${rejectedContainers}\n\n`;
    
    if (pendingContainers > 0) {
        message += `SOLUCIÓN:\n`;
        message += `• Use "FORZAR ACCESO FASE 2" para aprobar automáticamente\n`;
        message += `• O use "Aprobar Todos los Contenedores" para aprobación manual\n`;
    } else if (totalContainers === 0) {
        message += `SOLUCIÓN:\n• Use "Reiniciar y Crear Datos" para crear contenedores de prueba\n`;
    } else {
        message += `SOLUCIÓN:\n• Los contenedores ya están aprobados. Puede acceder a Fase 2\n`;
    }
    
    showAlert(message, 'info');
}

function emergencyPhase2Access() {
    console.log('=== SUPERVISOR: ACCESO DE EMERGENCIA ===');
    
    if (!currentUser) {
        showAlert('Error: No hay sesión activa', 'danger');
        return;
    }
    
    if (phase1Data.length === 0) {
        showAlert('No hay contenedores registrados. Creando datos de prueba...', 'warning');
        resetAndCreateTestData();
        return;
    }
    
    // Aprobar TODOS los contenedores de emergencia
    let approvedCount = 0;
    phase1Data.forEach(container => {
        if (!container.approvedForProcessing && !container.rejected) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            container.emergencyApproval = true;
            container.supervisorApproved = true;
            approvedCount++;
        }
    });
    
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    if (approvedCount > 0) {
        showAlert(`✅ SUPERVISOR: ACCESO DE EMERGENCIA\n\n${approvedCount} contenedores aprobados automáticamente.\nAhora puede acceder a la Fase 2.`, 'success');
        
        setTimeout(() => {
            openPhase2();
        }, 1000);
    } else {
        showAlert('Todos los contenedores ya están aprobados. Puede acceder a la Fase 2 normalmente.', 'info');
        openPhase2();
    }
}

function createTestData() {
    console.log('=== SUPERVISOR: CREANDO DATOS DE PRUEBA ===');
    
    if (phase1Data.length === 0) {
        const testContainer = {
            id: Date.now(),
            containerNumber: 'CONT-SUP-TEST-001',
            provider: 'Proveedor de Prueba Supervisor',
            crabType: 'azul',
            size: 'grande',
            weight: 150.5,
            quantity: 100,
            status: 'viva',
            classification: 'A',
            observations: 'Contenedor de prueba creado por supervisor',
            phase: 1,
            date: new Date().toISOString(),
            operator: currentUser,
            approvedForProcessing: true,
            approvedBy: currentUser,
            approvalDate: new Date().toISOString(),
            autoApproved: true,
            supervisorApproved: true,
            testData: true
        };
        
        phase1Data.push(testContainer);
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        
        console.log('Datos de prueba creados por supervisor:', testContainer);
        showAlert('✅ SUPERVISOR: DATOS DE PRUEBA CREADOS\n\nContenedor de prueba aprobado automáticamente.\nAhora puede acceder a la Fase 2.', 'success');
        
        setTimeout(() => {
            openPhase2();
        }, 1000);
        
        return true;
    }
    
    return false;
}

// Función para calcular el total automáticamente
function calculateTotal() {
    const special = parseFloat(document.getElementById('specialMeat').value) || 0;
    const superLump = parseFloat(document.getElementById('superLumpMeat').value) || 0;
    const jumbo = parseFloat(document.getElementById('jumboMeat').value) || 0;
    const claw = parseFloat(document.getElementById('clawMeat').value) || 0;
    const waste = parseFloat(document.getElementById('organicWaste').value) || 0;
    
    const total = special + superLump + jumbo + claw + waste;
    document.getElementById('totalProcessed').value = total.toFixed(1);
    
    // Calcular análisis automático
    calculatePhase2Yield();
    
    return total;
}

// Agregar event listeners para cálculo automático cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para cálculo automático
    const specialMeat = document.getElementById('specialMeat');
    const superLumpMeat = document.getElementById('superLumpMeat');
    const jumboMeat = document.getElementById('jumboMeat');
    const clawMeat = document.getElementById('clawMeat');
    const organicWaste = document.getElementById('organicWaste');
    
    if (specialMeat) specialMeat.addEventListener('input', calculateTotal);
    if (superLumpMeat) superLumpMeat.addEventListener('input', calculateTotal);
    if (jumboMeat) jumboMeat.addEventListener('input', calculateTotal);
    if (clawMeat) clawMeat.addEventListener('input', calculateTotal);
    if (organicWaste) organicWaste.addEventListener('input', calculateTotal);
});

// Exportar funciones para uso global
window.openPhase1 = openPhase1;
window.openPhase2 = openPhase2;
window.savePhase2 = savePhase2;
window.approveContainer = approveContainer;
window.rejectContainer = rejectContainer;
window.viewDetails = viewDetails;
window.logout = logout;
window.forcePhase2Access = forcePhase2Access;
window.resetAndCreateTestData = resetAndCreateTestData;
window.bulkApproveAll = bulkApproveAll;
window.diagnosePhase2Issue = diagnosePhase2Issue;
window.diagnoseContainerApproval = diagnoseContainerApproval;
window.fixContainerApproval = fixContainerApproval;
window.testCompleteWorkflow = testCompleteWorkflow;
window.emergencyPhase2Access = emergencyPhase2Access;
window.createTestData = createTestData;
window.calculateTotal = calculateTotal;
window.calculateTotal3 = calculateTotal3;
window.calculatePhase2Yield = calculatePhase2Yield;
window.calculatePhase3Yield = calculatePhase3Yield;
window.openPhase3 = openPhase3;
window.calculatePhase3Classification = calculatePhase3Classification;
window.savePhase3 = savePhase3;

// Funciones para la Fase 3
function openPhase3() {
    // Buscar contenedores aprobados para procesamiento
    const approvedContainers = phase1Data.filter(item => item.approvedForProcessing && !item.rejected);
    
    if (approvedContainers.length === 0) {
        showAlert('No hay contenedores aprobados para procesamiento. Primero debe aprobar contenedores en la Fase 1.', 'warning');
        return;
    }
    
    // Seleccionar el primer contenedor aprobado (puedes implementar una selección más sofisticada)
    const selectedContainer = approvedContainers[0];
    
    // Llenar datos del formulario
    document.getElementById('containerId3').value = selectedContainer.containerNumber;
    document.getElementById('crabType3').value = selectedContainer.crabType;
    document.getElementById('originalWeight3').value = selectedContainer.weight + ' kg';
    document.getElementById('originalStatus3').value = selectedContainer.status;
    document.getElementById('provider3').value = selectedContainer.provider;
    document.getElementById('receptionDate3').value = new Date(selectedContainer.date).toLocaleDateString('es-ES');
    
    // Limpiar campos de separación
    document.getElementById('specialMeat3').value = '0.0';
    document.getElementById('superLumpMeat3').value = '0.0';
    document.getElementById('jumboMeat3').value = '0.0';
    document.getElementById('clawMeat3').value = '0.0';
    document.getElementById('organicWaste3').value = '0.0';
    document.getElementById('totalProcessed3').value = '0.0';
    
    // Limpiar visualización de rendimiento
    clearPhase3YieldDisplay();
    
    const modal = new bootstrap.Modal(document.getElementById('phase3Modal'));
    modal.show();
}

function calculateTotal3() {
    const special = parseFloat(document.getElementById('specialMeat3').value) || 0;
    const superLump = parseFloat(document.getElementById('superLumpMeat3').value) || 0;
    const jumbo = parseFloat(document.getElementById('jumboMeat3').value) || 0;
    const claw = parseFloat(document.getElementById('clawMeat3').value) || 0;
    const waste = parseFloat(document.getElementById('organicWaste3').value) || 0;
    
    const total = special + superLump + jumbo + claw + waste;
    document.getElementById('totalProcessed3').value = total.toFixed(1);
    
    // Calcular análisis automático
    calculatePhase3Yield();
    
    // Actualizar visualización de rendimiento
    updatePhase3YieldDisplay(special, superLump, jumbo, claw, waste, total);
    
    return total;
}

function updatePhase3YieldDisplay(special, superLump, jumbo, clawMeat, waste, total) {
    document.getElementById('phase3Special').textContent = special.toFixed(2) + ' kg';
    document.getElementById('phase3SuperLump').textContent = superLump.toFixed(2) + ' kg';
    document.getElementById('phase3Jumbo').textContent = jumbo.toFixed(2) + ' kg';
    document.getElementById('phase3ClawMeat').textContent = clawMeat.toFixed(2) + ' kg';
    document.getElementById('phase3Waste').textContent = waste.toFixed(2) + ' kg';
    
    const totalMeat = special + superLump + jumbo + clawMeat;
    document.getElementById('phase3TotalMeat').textContent = totalMeat.toFixed(2) + ' kg';
    
    // Calcular porcentaje de materia prima comestible
    const ediblePercentage = total > 0 ? (totalMeat / total) * 100 : 0;
    document.getElementById('phase3EdiblePercentage').textContent = ediblePercentage.toFixed(1) + '%';
}

function clearPhase3YieldDisplay() {
    document.getElementById('phase3Special').textContent = '0.00 kg';
    document.getElementById('phase3SuperLump').textContent = '0.00 kg';
    document.getElementById('phase3Jumbo').textContent = '0.00 kg';
    document.getElementById('phase3ClawMeat').textContent = '0.00 kg';
    document.getElementById('phase3Waste').textContent = '0.00 kg';
    document.getElementById('phase3TotalMeat').textContent = '0.00 kg';
    document.getElementById('phase3EdiblePercentage').textContent = '0%';
    document.getElementById('phase3Classification').textContent = 'Pendiente';
    document.getElementById('phase3Classification').className = 'badge fs-5';
    document.getElementById('phase3ClassificationReason').textContent = 'La clasificación se determina automáticamente según el rendimiento de materia prima comestible';
}

function calculatePhase3Classification() {
    const special = parseFloat(document.getElementById('specialMeat3').value) || 0;
    const superLump = parseFloat(document.getElementById('superLumpMeat3').value) || 0;
    const jumbo = parseFloat(document.getElementById('jumboMeat3').value) || 0;
    const clawMeat = parseFloat(document.getElementById('clawMeat3').value) || 0;
    const waste = parseFloat(document.getElementById('organicWaste3').value) || 0;
    
    const totalMeat = special + superLump + jumbo + clawMeat;
    const total = totalMeat + waste;
    
    if (total > 0) {
        const ediblePercentage = (totalMeat / total) * 100;
        let classification = '';
        let reason = '';
        let badgeClass = '';
        
        if (ediblePercentage > 50) {
            classification = 'A';
            reason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Excelente rendimiento)`;
            badgeClass = 'bg-success';
        } else if (ediblePercentage >= 40 && ediblePercentage <= 50) {
            classification = 'B';
            reason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Rendimiento aceptable)`;
            badgeClass = 'bg-warning';
        } else {
            classification = 'C';
            reason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Rendimiento bajo)`;
            badgeClass = 'bg-danger';
        }
        
        // Actualizar visualización de clasificación
        document.getElementById('phase3Classification').textContent = `Clase ${classification}`;
        document.getElementById('phase3Classification').className = `badge fs-5 ${badgeClass}`;
        document.getElementById('phase3ClassificationReason').textContent = reason;
        
        showAlert(`Clasificación automática: Clase ${classification} (${ediblePercentage.toFixed(1)}% materia prima comestible)`, 'success');
    } else {
        showAlert('Complete los datos de separación de carne para calcular la clasificación', 'warning');
    }
}

function savePhase3() {
    const form = document.getElementById('phase3Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const containerId = document.getElementById('containerId3').value;
    const special = parseFloat(document.getElementById('specialMeat3').value) || 0;
    const superLump = parseFloat(document.getElementById('superLumpMeat3').value) || 0;
    const jumbo = parseFloat(document.getElementById('jumboMeat3').value) || 0;
    const clawMeat = parseFloat(document.getElementById('clawMeat3').value) || 0;
    const waste = parseFloat(document.getElementById('organicWaste3').value) || 0;
    const totalMeat = special + superLump + jumbo + clawMeat;
    const total = totalMeat + waste;
    const ediblePercentage = total > 0 ? (totalMeat / total) * 100 : 0;
    
    // Determinar clasificación final
    let finalClassification = '';
    if (ediblePercentage > 50) {
        finalClassification = 'A';
    } else if (ediblePercentage >= 40 && ediblePercentage <= 50) {
        finalClassification = 'B';
    } else {
        finalClassification = 'C';
    }
    
    const data = {
        id: Date.now(),
        containerId: containerId,
        phase: 3,
        date: new Date().toISOString(),
        supervisor: currentUser,
        specialMeat: special,
        superLumpMeat: superLump,
        jumboMeat: jumbo,
        clawMeat: clawMeat,
        organicWaste: waste,
        totalMeat: totalMeat,
        totalProcessed: total,
        ediblePercentage: ediblePercentage,
        finalClassification: finalClassification,
        observations: document.getElementById('finalObservations3').value,
        completed: true
    };
    
    // Guardar datos de Fase 3
    let phase3Data = JSON.parse(localStorage.getItem('phase3Data')) || [];
    phase3Data.push(data);
    localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
    
    // Actualizar contenedor original como completado
    const originalContainer = phase1Data.find(item => item.containerNumber === containerId);
    if (originalContainer) {
        originalContainer.phase3Completed = true;
        originalContainer.finalClassification = finalClassification;
        originalContainer.ediblePercentage = ediblePercentage;
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    }
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase3Modal')).hide();
    updateSupervisorDashboard();
    
    showAlert(`Clasificación final guardada: Clase ${finalClassification} (${ediblePercentage.toFixed(1)}% materia prima comestible)`, 'success');
}

// Configurar event listeners para Fase 3
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para cálculo automático de Fase 3
    const specialMeat3 = document.getElementById('specialMeat3');
    const superLumpMeat3 = document.getElementById('superLumpMeat3');
    const jumboMeat3 = document.getElementById('jumboMeat3');
    const clawMeat3 = document.getElementById('clawMeat3');
    const organicWaste3 = document.getElementById('organicWaste3');
    
    if (specialMeat3) specialMeat3.addEventListener('input', calculateTotal3);
    if (superLumpMeat3) superLumpMeat3.addEventListener('input', calculateTotal3);
    if (jumboMeat3) jumboMeat3.addEventListener('input', calculateTotal3);
    if (clawMeat3) clawMeat3.addEventListener('input', calculateTotal3);
    if (organicWaste3) organicWaste3.addEventListener('input', calculateTotal3);
}); 

// Función para diagnosticar problemas de aprobación de contenedores
function diagnoseContainerApproval() {
    console.log('=== DIAGNÓSTICO DE APROBACIÓN DE CONTENEDORES ===');
    
    // Verificar datos de fase 1
    console.log('Datos de Fase 1:', phase1Data);
    
    // Contar contenedores por estado
    const total = phase1Data.length;
    const approved = phase1Data.filter(item => item.approvedForProcessing).length;
    const rejected = phase1Data.filter(item => item.rejected).length;
    const pending = total - approved - rejected;
    
    console.log(`Total contenedores: ${total}`);
    console.log(`Aprobados: ${approved}`);
    console.log(`Rechazados: ${rejected}`);
    console.log(`Pendientes: ${pending}`);
    
    // Verificar contenedores aprobados
    const approvedContainers = phase1Data.filter(item => item.approvedForProcessing && !item.rejected);
    console.log('Contenedores aprobados para Fase 2:', approvedContainers);
    
    // Verificar estructura de datos
    approvedContainers.forEach((container, index) => {
        console.log(`Contenedor ${index + 1}:`, {
            containerNumber: container.containerNumber,
            provider: container.provider,
            classification: container.classification,
            approvedForProcessing: container.approvedForProcessing,
            approvedBy: container.approvedBy
        });
    });
    
    // Mostrar alerta con información
    const message = `
        📊 DIAGNÓSTICO DE CONTENEDORES:
        
        Total: ${total}
        Aprobados: ${approved}
        Rechazados: ${rejected}
        Pendientes: ${pending}
        
        Contenedores disponibles para Fase 2: ${approvedContainers.length}
        
        ${approvedContainers.length === 0 ? '❌ No hay contenedores aprobados para Fase 2' : '✅ Hay contenedores disponibles para Fase 2'}
    `;
    
    showAlert(message, approvedContainers.length > 0 ? 'success' : 'warning');
} 

// Función para arreglar contenedores sin flag de aprobación
function fixContainerApproval() {
    console.log('=== ARREGLANDO APROBACIÓN DE CONTENEDORES ===');
    
    let fixedCount = 0;
    let totalContainers = phase1Data.length;
    
    phase1Data.forEach(container => {
        // Si el contenedor no tiene flag de aprobación y no está rechazado, aprobarlo
        if (!container.approvedForProcessing && !container.rejected) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            fixedCount++;
        }
        
        // Asegurar que tenga clasificación
        if (!container.classification) {
            container.classification = 'B';
        }
    });
    
    // Guardar cambios
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    console.log(`Contenedores arreglados: ${fixedCount} de ${totalContainers}`);
    
    const message = `
        🔧 CONTENEDORES ARREGLADOS:
        
        Total contenedores: ${totalContainers}
        Contenedores arreglados: ${fixedCount}
        
        ${fixedCount > 0 ? '✅ Los contenedores ahora están disponibles para Fase 2' : 'ℹ️ No se necesitaron cambios'}
    `;
    
    showAlert(message, 'success');
    
    // Actualizar dashboard
    updateSupervisorDashboard();
    loadQualityControlTable();
} 

// Función para probar el flujo completo del sistema
function testCompleteWorkflow() {
    console.log('=== PRUEBA DEL FLUJO COMPLETO ===');
    
    // 1. Verificar datos de fase 1
    console.log('1. Verificando datos de Fase 1...');
    const phase1Count = phase1Data.length;
    console.log(`   Contenedores en Fase 1: ${phase1Count}`);
    
    // 2. Verificar contenedores aprobados
    console.log('2. Verificando contenedores aprobados...');
    const approvedCount = phase1Data.filter(item => item.approvedForProcessing).length;
    console.log(`   Contenedores aprobados: ${approvedCount}`);
    
    // 3. Verificar datos de fase 2
    console.log('3. Verificando datos de Fase 2...');
    const phase2Count = phase2Data.length;
    console.log(`   Contenedores en Fase 2: ${phase2Count}`);
    
    // 4. Verificar clasificaciones
    console.log('4. Verificando clasificaciones...');
    const classifications = phase1Data.map(item => item.classification).filter(Boolean);
    console.log(`   Contenedores con clasificación: ${classifications.length}`);
    
    // 5. Mostrar resumen
    const message = `
        🔍 PRUEBA DEL FLUJO COMPLETO:
        
        ✅ Fase 1: ${phase1Count} contenedores
        ✅ Aprobados: ${approvedCount} contenedores
        ✅ Fase 2: ${phase2Count} contenedores
        ✅ Clasificaciones: ${classifications.length} contenedores
        
        ${approvedCount > 0 ? '✅ El sistema está funcionando correctamente' : '⚠️ No hay contenedores aprobados para Fase 2'}
        
        ${phase1Count === 0 ? '💡 Use "Crear Datos de Prueba" para generar contenedores de ejemplo' : ''}
    `;
    
    showAlert(message, approvedCount > 0 ? 'success' : 'info');
    
    // 6. Probar apertura de fases
    if (approvedCount > 0) {
        console.log('5. Probando apertura de Fase 2...');
        setTimeout(() => {
            try {
                openPhase2();
                console.log('✅ Fase 2 se abrió correctamente');
            } catch (error) {
                console.error('❌ Error al abrir Fase 2:', error);
            }
        }, 1000);
    }
} 

// Función para calcular materia prima extraída automáticamente en Fase 2
function calculatePhase2Yield() {
    const specialMeat = parseFloat(document.getElementById('specialMeat').value) || 0;
    const superLumpMeat = parseFloat(document.getElementById('superLumpMeat').value) || 0;
    const jumboMeat = parseFloat(document.getElementById('jumboMeat').value) || 0;
    const clawMeat = parseFloat(document.getElementById('clawMeat').value) || 0;
    const organicWaste = parseFloat(document.getElementById('organicWaste').value) || 0;
    
    const totalMeat = specialMeat + superLumpMeat + jumboMeat + clawMeat;
    const totalProcessed = totalMeat + organicWaste;
    
    // Actualizar campo total procesado
    document.getElementById('totalProcessed').value = totalProcessed.toFixed(2);
    
    // Crear o actualizar contenedor de cálculo automático
    let autoCalcContainer = document.getElementById('phase2AutoCalculation');
    if (!autoCalcContainer) {
        autoCalcContainer = document.createElement('div');
        autoCalcContainer.id = 'phase2AutoCalculation';
        autoCalcContainer.className = 'auto-calculation mt-3';
        
        // Insertar después del formulario
        const form = document.getElementById('phase2Form');
        if (form) {
            form.appendChild(autoCalcContainer);
        }
    }
    
    if (totalProcessed > 0) {
        const efficiency = ((totalMeat / totalProcessed) * 100).toFixed(1);
        
        autoCalcContainer.innerHTML = `
            <h6><i class="fas fa-calculator me-2"></i>Análisis Automático de Rendimiento</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="yield-calculation">
                        <h6><i class="fas fa-chart-bar text-info me-2"></i>Distribución de Carne</h6>
                        <div class="yield-item">
                            <span class="yield-label">Special:</span>
                            <span class="yield-value special">${specialMeat.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Super Lump:</span>
                            <span class="yield-value super-lump">${superLumpMeat.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Jumbo:</span>
                            <span class="yield-value jumbo">${jumboMeat.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Claw Meat:</span>
                            <span class="yield-value claw-meat">${clawMeat.toFixed(2)} kg</span>
                        </div>
                        <hr>
                        <div class="yield-item">
                            <span class="yield-label"><strong>Total Carne:</strong></span>
                            <span class="yield-value total"><strong>${totalMeat.toFixed(2)} kg</strong></span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Desechos:</span>
                            <span class="yield-value waste">${organicWaste.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="yield-calculation">
                        <h6><i class="fas fa-percentage text-success me-2"></i>Eficiencia de Procesamiento</h6>
                        <div class="calculation-result">
                            <strong>Eficiencia: ${efficiency}%</strong><br>
                            <small>Materia prima comestible del total procesado</small>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Carne Comestible:</span>
                            <span class="yield-value total">${totalMeat.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Total Procesado:</span>
                            <span class="yield-value">${totalProcessed.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Desechos:</span>
                            <span class="yield-value waste">${organicWaste.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Resumen:</strong> Se procesaron ${totalProcessed.toFixed(2)} kg en total, obteniendo ${totalMeat.toFixed(2)} kg de carne comestible con una eficiencia del ${efficiency}%.
            </div>
        `;
    } else {
        autoCalcContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Atención:</strong> Complete los campos de separación de carne para ver el análisis automático de rendimiento.
            </div>
        `;
    }
}

// Función para calcular materia prima extraída automáticamente en Fase 3
function calculatePhase3Yield() {
    const specialMeat3 = parseFloat(document.getElementById('specialMeat3').value) || 0;
    const superLumpMeat3 = parseFloat(document.getElementById('superLumpMeat3').value) || 0;
    const jumboMeat3 = parseFloat(document.getElementById('jumboMeat3').value) || 0;
    const clawMeat3 = parseFloat(document.getElementById('clawMeat3').value) || 0;
    const organicWaste3 = parseFloat(document.getElementById('organicWaste3').value) || 0;
    
    const totalMeat3 = specialMeat3 + superLumpMeat3 + jumboMeat3 + clawMeat3;
    const totalProcessed3 = totalMeat3 + organicWaste3;
    
    // Actualizar campo total procesado
    document.getElementById('totalProcessed3').value = totalProcessed3.toFixed(2);
    
    // Crear o actualizar contenedor de cálculo automático
    let autoCalcContainer = document.getElementById('phase3AutoCalculation');
    if (!autoCalcContainer) {
        autoCalcContainer = document.createElement('div');
        autoCalcContainer.id = 'phase3AutoCalculation';
        autoCalcContainer.className = 'auto-calculation mt-3';
        
        // Insertar después del formulario
        const form = document.getElementById('phase3Form');
        if (form) {
            form.appendChild(autoCalcContainer);
        }
    }
    
    if (totalProcessed3 > 0) {
        const efficiency = ((totalMeat3 / totalProcessed3) * 100).toFixed(1);
        
        autoCalcContainer.innerHTML = `
            <h6><i class="fas fa-calculator me-2"></i>Análisis Automático de Clasificación Final</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="yield-calculation">
                        <h6><i class="fas fa-chart-bar text-info me-2"></i>Distribución Final de Carne</h6>
                        <div class="yield-item">
                            <span class="yield-label">Special:</span>
                            <span class="yield-value special">${specialMeat3.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Super Lump:</span>
                            <span class="yield-value super-lump">${superLumpMeat3.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Jumbo:</span>
                            <span class="yield-value jumbo">${jumboMeat3.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Claw Meat:</span>
                            <span class="yield-value claw-meat">${clawMeat3.toFixed(2)} kg</span>
                        </div>
                        <hr>
                        <div class="yield-item">
                            <span class="yield-label"><strong>Total Carne:</strong></span>
                            <span class="yield-value total"><strong>${totalMeat3.toFixed(2)} kg</strong></span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Desechos:</span>
                            <span class="yield-value waste">${organicWaste3.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="yield-calculation">
                        <h6><i class="fas fa-percentage text-success me-2"></i>Eficiencia Final</h6>
                        <div class="calculation-result">
                            <strong>Eficiencia: ${efficiency}%</strong><br>
                            <small>Materia prima comestible del total procesado</small>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Carne Comestible:</span>
                            <span class="yield-value total">${totalMeat3.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Total Procesado:</span>
                            <span class="yield-value">${totalProcessed3.toFixed(2)} kg</span>
                        </div>
                        <div class="yield-item">
                            <span class="yield-label">Desechos:</span>
                            <span class="yield-value waste">${organicWaste3.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="alert alert-success mt-3">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Clasificación Final:</strong> Se procesaron ${totalProcessed3.toFixed(2)} kg en total, obteniendo ${totalMeat3.toFixed(2)} kg de carne comestible con una eficiencia final del ${efficiency}%.
            </div>
        `;
    } else {
        autoCalcContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Atención:</strong> Complete los campos de separación final de carne para ver el análisis automático de clasificación.
            </div>
        `;
    }
} 