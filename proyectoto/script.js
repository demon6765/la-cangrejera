// Sistema de Gestión de Cangrejas - Maracaibo
// Variables globales
let currentUser = null;
let currentSecurityLevel = null;
let containers = JSON.parse(localStorage.getItem('containers')) || [];
let phase1Data = JSON.parse(localStorage.getItem('phase1Data')) || [];
let phase2Data = JSON.parse(localStorage.getItem('phase2Data')) || [];
let phase3Data = JSON.parse(localStorage.getItem('phase3Data')) || [];

// Configuración de niveles de seguridad
const securityLevels = {
    operador: {
        name: 'Operador Receptor',
        level: 1,
        permissions: ['phase1'],
        badge: 'Operador'
    },
    supervisor: {
        name: 'Supervisor de Calidad',
        level: 2,
        permissions: ['phase1', 'phase2'],
        badge: 'Supervisor'
    },
    gerente: {
        name: 'Gerente de Proceso',
        level: 3,
        permissions: ['phase1', 'phase2', 'phase3'],
        badge: 'Gerente'
    },
    admin: {
        name: 'Administrador',
        level: 4,
        permissions: ['phase1', 'phase2', 'phase3', 'admin'],
        badge: 'Admin'
    }
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Configurar formulario de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Verificar si hay sesión activa
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        loginUser(userData.username, userData.securityLevel);
    }
    
    // Cargar datos iniciales
    updateDashboard();
}

// Manejo de autenticación
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const securityLevel = document.getElementById('securityLevel').value;
    
    if (!username || !password || !securityLevel) {
        showAlert('Por favor complete todos los campos', 'warning');
        return;
    }
    
    // Simulación de autenticación (en producción usar backend)
    if (password.length >= 4) {
        loginUser(username, securityLevel);
    } else {
        showAlert('Contraseña debe tener al menos 4 caracteres', 'danger');
    }
}

function loginUser(username, securityLevel) {
    currentUser = username;
    currentSecurityLevel = securityLevel;
    
    // Guardar sesión
    localStorage.setItem('currentUser', JSON.stringify({
        username: username,
        securityLevel: securityLevel
    }));
    
    // Actualizar interfaz
    document.getElementById('currentUser').textContent = username;
    document.getElementById('securityBadge').textContent = securityLevels[securityLevel].badge;
    
    // Mostrar aplicación principal
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Configurar permisos según nivel de seguridad
    configurePermissions();
    
    showAlert(`Bienvenido ${username}`, 'success');
}

function logout() {
    currentUser = null;
    currentSecurityLevel = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Limpiar formulario
    document.getElementById('loginForm').reset();
    
    showAlert('Sesión cerrada exitosamente', 'info');
}

function configurePermissions() {
    const userLevel = securityLevels[currentSecurityLevel];
    
    // Configurar visibilidad de botones según permisos
    const phase1Btn = document.querySelector('[onclick="openPhase1()"]');
    const phase2Btn = document.querySelector('[onclick="openPhase2()"]');
    const phase3Btn = document.querySelector('[onclick="openPhase3()"]');
    
    if (!userLevel.permissions.includes('phase1')) {
        phase1Btn.disabled = true;
        phase1Btn.innerHTML = '<i class="fas fa-lock me-2"></i>Sin Permisos';
    }
    
    if (!userLevel.permissions.includes('phase2')) {
        phase2Btn.disabled = true;
        phase2Btn.innerHTML = '<i class="fas fa-lock me-2"></i>Sin Permisos';
    }
    
    if (!userLevel.permissions.includes('phase3')) {
        phase3Btn.disabled = true;
        phase3Btn.innerHTML = '<i class="fas fa-lock me-2"></i>Sin Permisos';
    }
}

// Funciones para las fases del proceso
function openPhase1() {
    if (!checkPermission('phase1')) {
        showAlert('No tienes permisos para acceder a esta fase', 'danger');
        return;
    }
    
    // Limpiar formulario
    document.getElementById('phase1Form').reset();
    
    // Generar ID único para el contenedor
    const containerId = 'CONT-' + Date.now();
    document.getElementById('containerNumber').value = containerId;
    
    const modal = new bootstrap.Modal(document.getElementById('phase1Modal'));
    modal.show();
}

function savePhase1() {
    const form = document.getElementById('phase1Form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = {
        id: Date.now(),
        containerNumber: document.getElementById('containerNumber').value,
        provider: document.getElementById('provider').value,
        crabType: document.getElementById('crabType').value,
        size: document.getElementById('size').value,
        weight: parseFloat(document.getElementById('weight').value),
        quantity: parseInt(document.getElementById('quantity').value),
        status: document.getElementById('status').value,
        classification: document.getElementById('classification').value,
        observations: document.getElementById('observations').value,
        phase: 1,
        date: new Date().toISOString(),
        operator: currentUser
    };
    
    // Validaciones específicas
    if (data.status === 'muerta') {
        if (!confirm('¿Está seguro de que desea registrar cangrejas muertas? Se generará un informe de devolución.')) {
            return;
        }
        data.rejected = true;
        data.rejectionReason = 'Cangrejas muertas detectadas';
    }
    
    // Guardar datos
    phase1Data.push(data);
    containers.push({
        id: data.id,
        containerNumber: data.containerNumber,
        provider: data.provider,
        type: data.crabType,
        weight: data.weight,
        status: data.status,
        classification: data.classification,
        phase: 1
    });
    
    // Persistir en localStorage
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    localStorage.setItem('containers', JSON.stringify(containers));
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase1Modal')).hide();
    updateDashboard();
    
    showAlert('Datos de Fase 1 guardados exitosamente', 'success');
}

function openPhase2() {
    console.log('=== ABRIENDO FASE 2 - VERSIÓN SIMPLIFICADA ===');
    
    // Verificar permisos básicos
    if (!currentUser || !currentSecurityLevel) {
        showAlert('Error: No hay sesión activa', 'danger');
        return;
    }
    
    // Verificar si hay datos de Fase 1
    if (phase1Data.length === 0) {
        // Crear datos de prueba automáticamente
        const testContainer = {
            id: Date.now(),
            containerNumber: 'CONT-TEST-001',
            provider: 'Proveedor de Prueba',
            crabType: 'azul',
            size: 'grande',
            weight: 150.5,
            quantity: 100,
            status: 'viva',
            classification: 'A',
            observations: 'Contenedor de prueba',
            phase: 1,
            date: new Date().toISOString(),
            operator: currentUser,
            approvedForProcessing: true,
            approvedBy: currentUser,
            approvalDate: new Date().toISOString(),
            autoApproved: true
        };
        
        phase1Data.push(testContainer);
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        console.log('Datos de prueba creados automáticamente');
    }
    
    // Aprobar todos los contenedores pendientes automáticamente
    let approvedCount = 0;
    phase1Data.forEach(container => {
        if (!container.approvedForProcessing && !container.rejected) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            approvedCount++;
        }
    });
    
    if (approvedCount > 0) {
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        console.log(`${approvedCount} contenedores aprobados automáticamente`);
    }
    
    // Crear un formulario simple en una nueva ventana
    const phase2Window = window.open('', 'Fase2', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (phase2Window) {
        const phase2HTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fase 2 - Procesamiento</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .form-container { background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 30px; margin: 20px; }
                .btn-custom { background: linear-gradient(45deg, #3498db, #2c3e50); border: none; color: white; border-radius: 25px; }
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="form-container">
                    <h2 class="text-center mb-4">
                        <i class="fas fa-fire text-success me-2"></i>
                        Fase 2: Procesamiento de Cangrejas
                    </h2>
                    
                    <form id="phase2Form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Contenedor ID</label>
                                    <select class="form-select" id="containerSelect" required>
                                        <option value="">Seleccionar contenedor</option>
                                        ${phase1Data.map(container => 
                                            `<option value="${container.containerNumber}">${container.containerNumber} - ${container.provider} (${container.classification})</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Temperatura de Cocción (°C)</label>
                                    <input type="number" class="form-control" id="cookingTemp" value="85" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tiempo de Cocción (min)</label>
                                    <input type="number" class="form-control" id="cookingTime" value="15" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Temperatura de Enfriamiento (°C)</label>
                                    <input type="number" class="form-control" id="coolingTemp" value="4" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Calidad Final</label>
                                    <select class="form-select" id="finalQuality" required>
                                        <option value="A">A - Excelente</option>
                                        <option value="B">B - Buena</option>
                                        <option value="C">C - Aceptable</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Estado del Proceso</label>
                                    <select class="form-select" id="processStatus" required>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="completado">Completado</option>
                                        <option value="pausado">Pausado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Separación de Carne - 5 Partes -->
                        <div class="card mb-3">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0">
                                    <i class="fas fa-cut me-2"></i>
                                    Separación de Carne - Estación de Procesamiento
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-star text-warning me-1"></i>
                                                SPECIAL (kg) - Piezas pequeñas escamosas
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="specialMeat" value="15.0" required>
                                            <small class="text-muted">Carne blanca en piezas pequeñas y escamosas</small>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-star text-warning me-1"></i>
                                                SUPER LUMP (kg) - Piezas grandes intactas
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="superLumpMeat" value="20.0" required>
                                            <small class="text-muted">Piezas más grandes e intactas de carne blanca</small>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-crown text-warning me-1"></i>
                                                JUMBO (kg) - Trozos más grandes
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="jumboMeat" value="25.0" required>
                                            <small class="text-muted">Los trozos más grandes e intactos de carne blanca</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-hand-rock text-warning me-1"></i>
                                                CLAW MEAT (kg) - Carne de pinzas
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="clawMeat" value="10.0" required>
                                            <small class="text-muted">Carne específicamente de las pinzas</small>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-recycle text-danger me-1"></i>
                                                DESPERDICIO ORGÁNICO (kg)
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="organicWaste" value="30.0" required>
                                            <small class="text-muted">Material orgánico no aprovechable</small>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="fas fa-calculator text-info me-1"></i>
                                                TOTAL PROCESADO (kg)
                                            </label>
                                            <input type="number" step="0.1" class="form-control" id="totalProcessed" readonly>
                                            <small class="text-muted">Suma automática de todas las partes</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Notas de Calidad</label>
                            <textarea class="form-control" id="qualityNotes" rows="3" placeholder="Observaciones sobre el procesamiento..."></textarea>
                        </div>
                        
                        <div class="text-center">
                            <button type="submit" class="btn btn-custom btn-lg">
                                <i class="fas fa-save me-2"></i>Guardar Procesamiento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <script>
                // Función para calcular el total automáticamente
                function calculateTotal() {
                    const special = parseFloat(document.getElementById('specialMeat').value) || 0;
                    const superLump = parseFloat(document.getElementById('superLumpMeat').value) || 0;
                    const jumbo = parseFloat(document.getElementById('jumboMeat').value) || 0;
                    const claw = parseFloat(document.getElementById('clawMeat').value) || 0;
                    const waste = parseFloat(document.getElementById('organicWaste').value) || 0;
                    
                    const total = special + superLump + jumbo + claw + waste;
                    document.getElementById('totalProcessed').value = total.toFixed(1);
                    
                    return total;
                }
                
                // Agregar event listeners para cálculo automático
                document.getElementById('specialMeat').addEventListener('input', calculateTotal);
                document.getElementById('superLumpMeat').addEventListener('input', calculateTotal);
                document.getElementById('jumboMeat').addEventListener('input', calculateTotal);
                document.getElementById('clawMeat').addEventListener('input', calculateTotal);
                document.getElementById('organicWaste').addEventListener('input', calculateTotal);
                
                // Calcular total inicial
                calculateTotal();
                
                document.getElementById('phase2Form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = {
                        id: Date.now(),
                        containerId: document.getElementById('containerSelect').value,
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
                        operator: '${currentUser}'
                    };
                    
                    // Validaciones específicas para separación de carne
                    const totalMeat = formData.specialMeat + formData.superLumpMeat + formData.jumboMeat + formData.clawMeat;
                    const totalProcessed = formData.totalProcessed;
                    
                    if (totalMeat < 50) {
                        if (!confirm('El rendimiento de carne aprovechable es bajo (' + totalMeat + ' kg). ¿Desea continuar?')) {
                            return;
                        }
                    }
                    
                    if (formData.organicWaste > totalMeat * 0.6) {
                        if (!confirm('El desperdicio orgánico es alto (' + formData.organicWaste + ' kg). ¿Desea continuar?')) {
                            return;
                        }
                    }
                    
                    // Calcular porcentaje de aprovechamiento
                    const aprovechamiento = ((totalMeat / totalProcessed) * 100).toFixed(1);
                    formData.aprovechamiento = aprovechamiento + '%';
                    
                    // Guardar en localStorage
                    let phase2Data = JSON.parse(localStorage.getItem('phase2Data')) || [];
                    phase2Data.push(formData);
                    localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
                    
                    alert('✅ Procesamiento guardado exitosamente!');
                    window.close();
                });
            </script>
        </body>
        </html>
        `;
        
        phase2Window.document.write(phase2HTML);
        phase2Window.document.close();
        
        showAlert('✅ Fase 2 abierta en nueva ventana. Complete el formulario para procesar los contenedores.', 'success');
    } else {
        showAlert('Error: No se pudo abrir la ventana de Fase 2. Verifique que los popups estén habilitados.', 'danger');
    }
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
        meatYield: parseFloat(document.getElementById('meatYield').value),
        waste: parseFloat(document.getElementById('waste').value),
        finalQuality: document.getElementById('finalQuality').value,
        processStatus: document.getElementById('processStatus').value,
        qualityNotes: document.getElementById('qualityNotes').value,
        phase: 2,
        date: new Date().toISOString(),
        operator: currentUser
    };
    
    // Validaciones de calidad
    if (data.meatYield < 60) {
        if (!confirm('El rendimiento de carne es bajo. ¿Desea continuar?')) {
            return;
        }
    }
    
    if (data.waste > data.meatYield * 0.4) {
        if (!confirm('El desperdicio es alto. ¿Desea continuar?')) {
            return;
        }
    }
    
    // Guardar datos
    phase2Data.push(data);
    
    // Actualizar contenedor en la lista principal
    const containerIndex = containers.findIndex(c => c.containerNumber === data.containerId);
    if (containerIndex !== -1) {
        containers[containerIndex].phase = 2;
        containers[containerIndex].processStatus = data.processStatus;
    }
    
    // Persistir en localStorage
    localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
    localStorage.setItem('containers', JSON.stringify(containers));
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase2Modal')).hide();
    updateDashboard();
    
    showAlert('Datos de Fase 2 guardados exitosamente', 'success');
}

function openPhase3() {
    if (!checkPermission('phase3')) {
        showAlert('No tienes permisos para acceder a esta fase', 'danger');
        return;
    }
    
    // Mostrar contenedores disponibles de Fase 2
    const availableContainers = phase2Data.filter(item => item.processStatus === 'completado');
    
    if (availableContainers.length === 0) {
        showAlert('No hay contenedores procesados disponibles para exportar', 'warning');
        return;
    }
    
    // Crear selector de contenedores
    const containerSelect = document.createElement('select');
    containerSelect.className = 'form-select form-control-custom mb-3';
    containerSelect.id = 'containerSelect3';
    
    containerSelect.innerHTML = '<option value="">Seleccionar contenedor</option>';
    availableContainers.forEach(container => {
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
    updateDashboard();
    
    showAlert('Datos de Fase 3 guardados exitosamente', 'success');
}

// Funciones de aprobación de contenedores
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
            updateDashboard();
        } else {
            showAlert('Contenedor no encontrado', 'danger');
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
            updateDashboard();
        } else {
            showAlert('Contenedor no encontrado', 'danger');
        }
    }
}

function autoApproveContainer(containerNumber) {
    // Aprobación automática para admin y gerente
    const container = phase1Data.find(item => item.containerNumber === containerNumber);
    if (container) {
        container.approvedForProcessing = true;
        container.approvedBy = currentUser;
        container.approvalDate = new Date().toISOString();
        container.autoApproved = true;
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        showAlert(`Contenedor ${containerNumber} aprobado automáticamente`, 'success');
        updateDashboard();
    }
}

// Función para aprobar todos los contenedores pendientes (solo admin y gerente)
function bulkApproveAll() {
    if (currentSecurityLevel !== 'admin' && currentSecurityLevel !== 'gerente') {
        showAlert('Solo administradores y gerentes pueden usar esta función', 'danger');
        return;
    }
    
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
        updateDashboard();
    }
}

// Funciones de utilidad
function checkPermission(permission) {
    if (!currentSecurityLevel) return false;
    return securityLevels[currentSecurityLevel].permissions.includes(permission);
}

function updateDashboard() {
    // Actualizar estadísticas
    document.getElementById('totalContainers').textContent = containers.length;
    
    const claseA = containers.filter(c => c.classification === 'A').length;
    const claseB = containers.filter(c => c.classification === 'B').length;
    const claseC = containers.filter(c => c.classification === 'C').length;
    
    document.getElementById('claseA').textContent = claseA;
    document.getElementById('claseB').textContent = claseB;
    document.getElementById('claseC').textContent = claseC;
}

function showAlert(message, type) {
    // Crear alerta Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Funciones para mostrar datos
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
        
        // Determinar botones de acción según fase y permisos
        let actionButtons = '';
        if (phase === 1 && item.phase === 1) {
            if (item.approvedForProcessing) {
                actionButtons = '<span class="badge bg-success">✓ Aprobado</span>';
            } else if (item.rejected) {
                actionButtons = '<span class="badge bg-danger">✗ Rechazado</span>';
            } else {
                // Botones de aprobación para supervisor, admin y gerente
                if (checkPermission('phase2') || currentSecurityLevel === 'admin') {
                    actionButtons = `
                        <button class="btn btn-sm btn-success me-1" onclick="approveContainer('${item.containerNumber}')" title="Aprobar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectContainer('${item.containerNumber}')" title="Rechazar">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                } else {
                    actionButtons = '<span class="badge bg-warning">⏳ Pendiente</span>';
                }
            }
        } else if (phase === 2 && item.phase === 2) {
            if (item.processStatus === 'completado') {
                actionButtons = '<span class="badge bg-success">✓ Completado</span>';
            } else {
                actionButtons = '<span class="badge bg-warning">⏳ En Proceso</span>';
            }
        } else if (phase === 3 && item.phase === 3) {
            actionButtons = `<span class="badge bg-info">${item.shippingStatus || 'N/A'}</span>`;
        }
        
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
            <td>${actionButtons}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i>
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

function viewDetails(id) {
    // Implementar vista detallada
    showAlert('Función de vista detallada en desarrollo', 'info');
}

function editItem(id) {
    // Implementar edición
    showAlert('Función de edición en desarrollo', 'info');
}

// Funciones de exportación e informes
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
        rechazados: phase1Data.filter(d => d.rejected).length
    };
    
    // Crear archivo de descarga
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_cangrejas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Reporte generado y descargado', 'success');
}

// Función de diagnóstico para problemas de Fase 2
function diagnosePhase2Issue() {
    console.log('=== DIAGNÓSTICO FASE 2 ===');
    console.log('Usuario actual:', currentUser);
    console.log('Nivel de seguridad:', currentSecurityLevel);
    console.log('Permisos para Fase 2:', checkPermission('phase2'));
    
    console.log('\n=== ESTADO DE CONTENEDORES ===');
    console.log('Total contenedores Fase 1:', phase1Data.length);
    
    const pendingContainers = phase1Data.filter(item => !item.approvedForProcessing && !item.rejected);
    const approvedContainers = phase1Data.filter(item => item.approvedForProcessing);
    const rejectedContainers = phase1Data.filter(item => item.rejected);
    
    console.log('Pendientes de aprobación:', pendingContainers.length);
    console.log('Aprobados:', approvedContainers.length);
    console.log('Rechazados:', rejectedContainers.length);
    
    if (pendingContainers.length > 0) {
        console.log('\n=== CONTENEDORES PENDIENTES ===');
        pendingContainers.forEach((container, index) => {
            console.log(`${index + 1}. ${container.containerNumber} - ${container.provider} (${container.classification})`);
        });
    }
    
    if (approvedContainers.length > 0) {
        console.log('\n=== CONTENEDORES APROBADOS ===');
        approvedContainers.forEach((container, index) => {
            console.log(`${index + 1}. ${container.containerNumber} - ${container.provider} (${container.classification}) - Aprobado por: ${container.approvedBy}`);
        });
    }
    
    // Mostrar alerta con información
    let message = `DIAGNÓSTICO FASE 2:\n\n`;
    message += `Usuario: ${currentUser}\n`;
    message += `Nivel: ${currentSecurityLevel}\n`;
    message += `Permisos Fase 2: ${checkPermission('phase2') ? 'SÍ' : 'NO'}\n\n`;
    message += `Contenedores:\n`;
    message += `• Total: ${phase1Data.length}\n`;
    message += `• Pendientes: ${pendingContainers.length}\n`;
    message += `• Aprobados: ${approvedContainers.length}\n`;
    message += `• Rechazados: ${rejectedContainers.length}\n\n`;
    
    if (pendingContainers.length > 0) {
        message += `SOLUCIÓN:\n`;
        if (currentSecurityLevel === 'admin' || currentSecurityLevel === 'gerente') {
            message += `• Use el botón "Aprobar Todos los Contenedores"\n`;
            message += `• O apruebe individualmente desde "Ver Datos Fase 1"\n`;
        } else {
            message += `• Contacte a un administrador o gerente\n`;
            message += `• O registre nuevos contenedores en Fase 1\n`;
        }
    } else if (phase1Data.length === 0) {
        message += `SOLUCIÓN:\n• Primero registre contenedores en Fase 1\n`;
    } else {
        message += `SOLUCIÓN:\n• Los contenedores ya están aprobados\n`;
    }
    
    showAlert(message, 'info');
    
    // También mostrar en consola para debugging
    console.log('\n=== SOLUCIÓN ===');
    if (pendingContainers.length > 0) {
        if (currentSecurityLevel === 'admin' || currentSecurityLevel === 'gerente') {
            console.log('Use bulkApproveAll() para aprobar todos los contenedores pendientes');
        } else {
            console.log('Contacte a un administrador o gerente para aprobar contenedores');
        }
    }
}

// Función de emergencia para forzar acceso a Fase 2
function emergencyPhase2Access() {
    console.log('=== ACCESO DE EMERGENCIA A FASE 2 ===');
    
    if (!currentUser || !currentSecurityLevel) {
        showAlert('Error: No hay sesión activa', 'danger');
        return;
    }
    
    // Verificar si hay contenedores en Fase 1
    if (phase1Data.length === 0) {
        showAlert('No hay contenedores registrados en Fase 1. Primero debe registrar contenedores.', 'warning');
        return;
    }
    
    // Aprobar TODOS los contenedores de Fase 1 automáticamente
    let approvedCount = 0;
    phase1Data.forEach(container => {
        if (!container.approvedForProcessing && !container.rejected) {
            container.approvedForProcessing = true;
            container.approvedBy = currentUser;
            container.approvalDate = new Date().toISOString();
            container.autoApproved = true;
            container.emergencyApproval = true;
            approvedCount++;
        }
    });
    
    // Guardar cambios
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    console.log(`Aprobados ${approvedCount} contenedores de emergencia`);
    
    if (approvedCount > 0) {
        showAlert(`✅ ACCESO DE EMERGENCIA ACTIVADO\n\n${approvedCount} contenedores aprobados automáticamente.\nAhora puede acceder a la Fase 2.`, 'success');
        
        // Intentar abrir Fase 2 inmediatamente
        setTimeout(() => {
            openPhase2();
        }, 1000);
    } else {
        showAlert('Todos los contenedores ya están aprobados. Puede acceder a la Fase 2 normalmente.', 'info');
        openPhase2();
    }
}

// Función para verificar y crear datos de prueba si no hay contenedores
function createTestData() {
    console.log('=== CREANDO DATOS DE PRUEBA ===');
    
    if (phase1Data.length === 0) {
        const testContainer = {
            id: Date.now(),
            containerNumber: 'CONT-TEST-001',
            provider: 'Proveedor de Prueba',
            crabType: 'azul',
            size: 'grande',
            weight: 150.5,
            quantity: 100,
            status: 'viva',
            classification: 'A',
            observations: 'Contenedor de prueba creado automáticamente',
            phase: 1,
            date: new Date().toISOString(),
            operator: currentUser,
            approvedForProcessing: true,
            approvedBy: currentUser,
            approvalDate: new Date().toISOString(),
            autoApproved: true,
            testData: true
        };
        
        phase1Data.push(testContainer);
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        
        console.log('Datos de prueba creados:', testContainer);
        showAlert('✅ DATOS DE PRUEBA CREADOS\n\nContenedor de prueba aprobado automáticamente.\nAhora puede acceder a la Fase 2.', 'success');
        
        // Abrir Fase 2 inmediatamente
        setTimeout(() => {
            openPhase2();
        }, 1000);
        
        return true;
    }
    
    return false;
}

// Función para verificar y crear el modal de Fase 2 si no existe
function ensurePhase2Modal() {
    console.log('=== VERIFICANDO MODAL FASE 2 ===');
    
    let phase2Modal = document.getElementById('phase2Modal');
    
    if (!phase2Modal) {
        console.log('Modal de Fase 2 no encontrado. Creando...');
        
        // Crear el modal de Fase 2
        const modalHTML = `
        <div class="modal fade" id="phase2Modal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content modal-custom">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-fire me-2"></i>
                            Fase 2: Procesamiento
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="phase2Form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Contenedor ID</label>
                                        <input type="text" class="form-control form-control-custom" id="containerId2" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Temperatura de Cocción (°C)</label>
                                        <input type="number" class="form-control form-control-custom" id="cookingTemp" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Tiempo de Cocción (min)</label>
                                        <input type="number" class="form-control form-control-custom" id="cookingTime" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Temperatura de Enfriamiento (°C)</label>
                                        <input type="number" class="form-control form-control-custom" id="coolingTemp" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Rendimiento de Carne (%)</label>
                                        <input type="number" step="0.1" class="form-control form-control-custom" id="meatYield" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Desperdicio (kg)</label>
                                        <input type="number" step="0.1" class="form-control form-control-custom" id="waste" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Calidad Final</label>
                                        <select class="form-select form-control-custom" id="finalQuality" required>
                                            <option value="">Seleccionar calidad</option>
                                            <option value="A">A - Excelente</option>
                                            <option value="B">B - Buena</option>
                                            <option value="C">C - Aceptable</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Estado del Proceso</label>
                                        <select class="form-select form-control-custom" id="processStatus" required>
                                            <option value="">Seleccionar estado</option>
                                            <option value="en_proceso">En Proceso</option>
                                            <option value="completado">Completado</option>
                                            <option value="pausado">Pausado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notas de Calidad</label>
                                <textarea class="form-control form-control-custom" id="qualityNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-custom" onclick="savePhase2()">
                            <i class="fas fa-save me-2"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Agregar el modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        console.log('Modal de Fase 2 creado exitosamente');
        return true;
    }
    
    console.log('Modal de Fase 2 ya existe');
    return true;
}

// Eventos adicionales
document.addEventListener('keydown', function(e) {
    // Atajos de teclado
    if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        if (checkPermission('phase1')) openPhase1();
    }
    if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        if (checkPermission('phase2')) openPhase2();
    }
    if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        if (checkPermission('phase3')) openPhase3();
    }
});

// Función para limpiar datos (solo admin)
function clearAllData() {
    if (!checkPermission('admin')) {
        showAlert('Solo administradores pueden limpiar datos', 'danger');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('containers');
        localStorage.removeItem('phase1Data');
        localStorage.removeItem('phase2Data');
        localStorage.removeItem('phase3Data');
        
        containers = [];
        phase1Data = [];
        phase2Data = [];
        phase3Data = [];
        
        updateDashboard();
        showAlert('Todos los datos han sido eliminados', 'success');
    }
}

// Función para respaldo de datos
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
    link.download = `backup_cangrejas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Respaldo generado exitosamente', 'success');
}

// Función para restaurar datos
function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (backup.containers && backup.phase1Data && backup.phase2Data && backup.phase3Data) {
                containers = backup.containers;
                phase1Data = backup.phase1Data;
                phase2Data = backup.phase2Data;
                phase3Data = backup.phase3Data;
                
                localStorage.setItem('containers', JSON.stringify(containers));
                localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
                localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
                localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
                
                updateDashboard();
                showAlert('Datos restaurados exitosamente', 'success');
            } else {
                showAlert('Archivo de respaldo inválido', 'danger');
            }
        } catch (error) {
            showAlert('Error al restaurar datos: ' + error.message, 'danger');
        }
    };
    reader.readAsText(file);
}

// Exportar funciones para uso global
window.openPhase1 = openPhase1;
window.openPhase2 = openPhase2;
window.openPhase3 = openPhase3;
window.savePhase1 = savePhase1;
window.savePhase2 = savePhase2;
window.savePhase3 = savePhase3;
window.logout = logout;
window.showData = showData;
window.generateReport = generateReport;
window.clearAllData = clearAllData;
window.backupData = backupData;
window.restoreData = restoreData;
window.approveContainer = approveContainer;
window.rejectContainer = rejectContainer;
window.autoApproveContainer = autoApproveContainer;
window.bulkApproveAll = bulkApproveAll;
window.diagnosePhase2Issue = diagnosePhase2Issue;
window.emergencyPhase2Access = emergencyPhase2Access;
window.createTestData = createTestData;
window.ensurePhase2Modal = ensurePhase2Modal;
window.forcePhase2Access = forcePhase2Access;
window.resetAndCreateTestData = resetAndCreateTestData; 

// Función simple para forzar acceso a Fase 2
function forcePhase2Access() {
    console.log('=== FORZANDO ACCESO A FASE 2 ===');
    
    // Crear datos de prueba si no existen
    if (phase1Data.length === 0) {
        const testContainers = [
            {
                id: Date.now(),
                containerNumber: 'CONT-001',
                provider: 'Proveedor A',
                crabType: 'azul',
                size: 'grande',
                weight: 150.5,
                quantity: 100,
                status: 'viva',
                classification: 'A',
                observations: 'Contenedor de prueba 1',
                phase: 1,
                date: new Date().toISOString(),
                operator: currentUser,
                approvedForProcessing: true,
                approvedBy: currentUser,
                approvalDate: new Date().toISOString(),
                autoApproved: true
            },
            {
                id: Date.now() + 1,
                containerNumber: 'CONT-002',
                provider: 'Proveedor B',
                crabType: 'roja',
                size: 'mediano',
                weight: 120.0,
                quantity: 80,
                status: 'viva',
                classification: 'B',
                observations: 'Contenedor de prueba 2',
                phase: 1,
                date: new Date().toISOString(),
                operator: currentUser,
                approvedForProcessing: true,
                approvedBy: currentUser,
                approvalDate: new Date().toISOString(),
                autoApproved: true
            }
        ];
        
        phase1Data.push(...testContainers);
        localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
        console.log('Datos de prueba creados:', testContainers);
    }
    
    // Aprobar TODOS los contenedores existentes
    phase1Data.forEach(container => {
        container.approvedForProcessing = true;
        container.approvedBy = currentUser;
        container.approvalDate = new Date().toISOString();
        container.autoApproved = true;
    });
    
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    console.log('Todos los contenedores aprobados:', phase1Data);
    
    // Mostrar confirmación
    showAlert(`✅ ACCESO FORZADO A FASE 2\n\n${phase1Data.length} contenedores aprobados automáticamente.\nAhora puede acceder a la Fase 2.`, 'success');
    
    // Abrir Fase 2 inmediatamente
    setTimeout(() => {
        openPhase2();
    }, 1000);
}

// Función para limpiar y reiniciar datos
function resetAndCreateTestData() {
    console.log('=== REINICIANDO Y CREANDO DATOS DE PRUEBA ===');
    
    // Limpiar datos existentes
    phase1Data = [];
    phase2Data = [];
    phase3Data = [];
    
    // Crear datos de prueba aprobados
    const testContainers = [
        {
            id: Date.now(),
            containerNumber: 'CONT-TEST-001',
            provider: 'Proveedor de Prueba',
            crabType: 'azul',
            size: 'grande',
            weight: 150.5,
            quantity: 100,
            status: 'viva',
            classification: 'A',
            observations: 'Contenedor de prueba para Fase 2',
            phase: 1,
            date: new Date().toISOString(),
            operator: currentUser || 'Usuario',
            approvedForProcessing: true,
            approvedBy: currentUser || 'Usuario',
            approvalDate: new Date().toISOString(),
            autoApproved: true,
            testData: true
        }
    ];
    
    phase1Data = testContainers;
    
    // Guardar en localStorage
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    localStorage.setItem('phase2Data', JSON.stringify(phase2Data));
    localStorage.setItem('phase3Data', JSON.stringify(phase3Data));
    
    console.log('Datos de prueba creados:', testContainers);
    
    showAlert(`✅ DATOS REINICIADOS\n\nContenedor de prueba creado y aprobado.\nAhora puede acceder a la Fase 2.`, 'success');
    
    // Abrir Fase 2 inmediatamente
    setTimeout(() => {
        openPhase2();
    }, 1000);
} 

// Función que se ejecuta automáticamente para verificar el estado
function autoFixPhase2Data() {
    console.log('=== VERIFICACIÓN AUTOMÁTICA DE DATOS ===');
    
    // Verificar si hay datos de Fase 1
    if (phase1Data.length === 0) {
        console.log('No hay datos de Fase 1. Creando datos de prueba...');
        resetAndCreateTestData();
        return;
    }
    
    // Verificar si hay contenedores aprobados
    const approvedContainers = phase1Data.filter(container => container.approvedForProcessing);
    
    if (approvedContainers.length === 0) {
        console.log('No hay contenedores aprobados. Aprobando automáticamente...');
        forcePhase2Access();
        return;
    }
    
    console.log(`✅ Estado correcto: ${approvedContainers.length} contenedores aprobados`);
}

// Ejecutar verificación automática cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que se carguen todos los datos
    setTimeout(() => {
        autoFixPhase2Data();
    }, 1000);
}); 