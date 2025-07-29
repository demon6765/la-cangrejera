// Script específico para Operador Receptor
let currentUser = null;
let phase1Data = JSON.parse(localStorage.getItem('phase1Data')) || [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeOperador();
});

function initializeOperador() {
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
    updateOperadorDashboard();
    loadRecentContainers();
    
    // Configurar event listeners para cálculo automático
    setupYieldCalculationListeners();
}

// Configurar event listeners para cálculo automático de rendimiento
function setupYieldCalculationListeners() {
    const crabTypeSelect = document.getElementById('crabType');
    const weightInput = document.getElementById('weight');
    const statusSelect = document.getElementById('status');
    
    if (crabTypeSelect) {
        crabTypeSelect.addEventListener('change', calculateYield);
    }
    if (weightInput) {
        weightInput.addEventListener('input', calculateYield);
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', calculateYield);
    }
}

function updateOperadorDashboard() {
    // Actualizar estadísticas específicas del operador
    const totalProcessed = phase1Data.length;
    const approved = phase1Data.filter(item => item.approvedForProcessing).length;
    const rejected = phase1Data.filter(item => item.rejected).length;
    
    document.getElementById('totalProcessed').textContent = totalProcessed;
    document.getElementById('claseA').textContent = approved;
    document.getElementById('rejected').textContent = rejected;
}

function loadRecentContainers() {
    const tbody = document.getElementById('recentContainers');
    tbody.innerHTML = '';
    
    // Mostrar los últimos 10 contenedores
    const recentData = phase1Data.slice(-10).reverse();
    
    recentData.forEach(item => {
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
            <td>${new Date(item.date).toLocaleDateString('es-ES')}</td>
        `;
        tbody.appendChild(row);
    });
}

function openPhase1() {
    // Limpiar formulario
    document.getElementById('phase1Form').reset();
    
    // Generar ID único para el contenedor
    const containerId = 'CONT-' + Date.now();
    document.getElementById('containerNumber').value = containerId;
    
    // Limpiar cálculos de rendimiento
    clearYieldCalculations();
    
    const modal = new bootstrap.Modal(document.getElementById('phase1Modal'));
    modal.show();
}

// Función para calcular rendimiento automáticamente
function calculateYield() {
    const crabType = document.getElementById('crabType').value;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const status = document.getElementById('status').value;
    
    if (crabType && weight > 0 && status) {
        const yield = ConfigUtils.calculateMeatYield(crabType, weight, status);
        if (yield) {
            updateYieldDisplay(yield);
            calculateTotalYield(weight, yield);
        }
    } else {
        clearYieldCalculations();
    }
}

// Función para calcular el rendimiento total del cargamento
function calculateTotalYield(totalWeight, yieldData) {
    // Crear o actualizar el contenedor de cálculo automático
    let autoCalcContainer = document.getElementById('autoCalculationContainer');
    if (!autoCalcContainer) {
        autoCalcContainer = document.createElement('div');
        autoCalcContainer.id = 'autoCalculationContainer';
        autoCalcContainer.className = 'auto-calculation';
        
        // Insertar después del contenedor de rendimiento estimado
        const yieldContainer = document.querySelector('.card.bg-light');
        if (yieldContainer) {
            yieldContainer.parentNode.insertBefore(autoCalcContainer, yieldContainer.nextSibling);
        }
    }
    
    // Calcular materia prima extraída por cargamento
    const specialPerKg = yieldData.special / 1000; // Convertir de g a kg
    const superLumpPerKg = yieldData.superLump / 1000;
    const jumboPerKg = yieldData.jumbo / 1000;
    const clawMeatPerKg = yieldData.clawMeat / 1000;
    const wastePerKg = yieldData.waste / 1000;
    const totalMeatPerKg = yieldData.totalMeat / 1000;
    
    // Calcular para el peso total del cargamento
    const specialTotal = (specialPerKg * totalWeight).toFixed(2);
    const superLumpTotal = (superLumpPerKg * totalWeight).toFixed(2);
    const jumboTotal = (jumboPerKg * totalWeight).toFixed(2);
    const clawMeatTotal = (clawMeatPerKg * totalWeight).toFixed(2);
    const wasteTotal = (wastePerKg * totalWeight).toFixed(2);
    const totalMeatTotal = (totalMeatPerKg * totalWeight).toFixed(2);
    
    // Calcular porcentaje de materia prima comestible
    const ediblePercentage = ((totalMeatPerKg / 1) * 100).toFixed(1);
    
    autoCalcContainer.innerHTML = `
        <h6><i class="fas fa-calculator me-2"></i>Cálculo Automático para ${totalWeight} kg de Cargamento</h6>
        <div class="row">
            <div class="col-md-6">
                <div class="yield-calculation">
                    <h6><i class="fas fa-star text-info me-2"></i>Materia Prima Extraída</h6>
                    <div class="yield-item">
                        <span class="yield-label">Special:</span>
                        <span class="yield-value special">${specialTotal} kg</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Super Lump:</span>
                        <span class="yield-value super-lump">${superLumpTotal} kg</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Jumbo:</span>
                        <span class="yield-value jumbo">${jumboTotal} kg</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Claw Meat:</span>
                        <span class="yield-value claw-meat">${clawMeatTotal} kg</span>
                    </div>
                    <hr>
                    <div class="yield-item">
                        <span class="yield-label"><strong>Total Carne:</strong></span>
                        <span class="yield-value total"><strong>${totalMeatTotal} kg</strong></span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Desechos:</span>
                        <span class="yield-value waste">${wasteTotal} kg</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="yield-calculation">
                    <h6><i class="fas fa-chart-pie text-success me-2"></i>Rendimiento por Kilogramo</h6>
                    <div class="yield-item">
                        <span class="yield-label">Special por kg:</span>
                        <span class="yield-value special">${(specialPerKg * 1000).toFixed(1)} g</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Super Lump por kg:</span>
                        <span class="yield-value super-lump">${(superLumpPerKg * 1000).toFixed(1)} g</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Jumbo por kg:</span>
                        <span class="yield-value jumbo">${(jumboPerKg * 1000).toFixed(1)} g</span>
                    </div>
                    <div class="yield-item">
                        <span class="yield-label">Claw Meat por kg:</span>
                        <span class="yield-value claw-meat">${(clawMeatPerKg * 1000).toFixed(1)} g</span>
                    </div>
                    <hr>
                    <div class="yield-item">
                        <span class="yield-label"><strong>Total Carne por kg:</strong></span>
                        <span class="yield-value total"><strong>${(totalMeatPerKg * 1000).toFixed(1)} g</strong></span>
                    </div>
                    <div class="calculation-result">
                        <strong>Eficiencia: ${ediblePercentage}%</strong><br>
                        <small>Materia prima comestible por kilogramo</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="alert alert-info mt-3">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Resumen:</strong> De ${totalWeight} kg de cangrejas, se extraerán aproximadamente ${totalMeatTotal} kg de carne comestible (${ediblePercentage}% de eficiencia).
        </div>
    `;
}

// Función para actualizar la visualización del rendimiento
function updateYieldDisplay(yield) {
    document.getElementById('yieldSpecial').textContent = yield.special.toFixed(2) + ' kg';
    document.getElementById('yieldSuperLump').textContent = yield.superLump.toFixed(2) + ' kg';
    document.getElementById('yieldJumbo').textContent = yield.jumbo.toFixed(2) + ' kg';
    document.getElementById('yieldClawMeat').textContent = yield.clawMeat.toFixed(2) + ' kg';
    document.getElementById('yieldTotalMeat').textContent = yield.totalMeat.toFixed(2) + ' kg';
    document.getElementById('yieldWaste').textContent = yield.waste.toFixed(2) + ' kg';
    document.getElementById('yieldEfficiency').textContent = yield.efficiency.toFixed(1) + '%';
    
    // Calcular y mostrar porcentaje de materia prima comestible
    const totalWeight = parseFloat(yield.totalWeight);
    const totalMeat = parseFloat(yield.totalMeat);
    const ediblePercentage = (totalMeat / totalWeight) * 100;
    
    document.getElementById('ediblePercentage').textContent = ediblePercentage.toFixed(1) + '%';
    

}

// Función para limpiar los cálculos de rendimiento
function clearYieldCalculations() {
    document.getElementById('yieldSpecial').textContent = '0.00 kg';
    document.getElementById('yieldSuperLump').textContent = '0.00 kg';
    document.getElementById('yieldJumbo').textContent = '0.00 kg';
    document.getElementById('yieldClawMeat').textContent = '0.00 kg';
    document.getElementById('yieldTotalMeat').textContent = '0.00 kg';
    document.getElementById('yieldWaste').textContent = '0.00 kg';
    document.getElementById('yieldEfficiency').textContent = '0%';
    document.getElementById('ediblePercentage').textContent = '0%';
    

    
    // Limpiar cálculo automático
    const autoCalcContainer = document.getElementById('autoCalculationContainer');
    if (autoCalcContainer) {
        autoCalcContainer.remove();
    }
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
        status: document.getElementById('status').value,
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
    localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
    
    // Cerrar modal y actualizar dashboard
    bootstrap.Modal.getInstance(document.getElementById('phase1Modal')).hide();
    updateOperadorDashboard();
    loadRecentContainers();
    
    showAlert('Datos de recepción guardados exitosamente', 'success');
}



// Funciones de aprobación para el operador
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
            localStorage.setItem('phase1Data', JSON.stringify(phase1Data));
            showAlert(`Contenedor ${containerNumber} aprobado para procesamiento`, 'success');
            updateOperadorDashboard();
            loadRecentContainers();
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
            updateOperadorDashboard();
            loadRecentContainers();
        }
    }
}

// Función para mostrar estadísticas de rendimiento
function showYieldStatistics() {
    loadYieldStatistics();
    const modal = new bootstrap.Modal(document.getElementById('yieldStatisticsModal'));
    modal.show();
}

// Función para cargar estadísticas de rendimiento
function loadYieldStatistics() {
    const crabTypes = ['azul', 'roja', 'verde'];
    const testWeight = 1000; // 1kg para comparación
    
    crabTypes.forEach(type => {
        const stats = ConfigUtils.getYieldStatistics(type);
        const yield = ConfigUtils.getEstimatedYield(type, testWeight);
        
        if (stats && yield) {
            const containerId = type + 'Stats';
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = `
                    <div class="text-center mb-3">
                        <h6 class="text-muted">${stats.name}</h6>
                        <p class="mb-1"><strong>Peso Promedio:</strong> ${stats.averageWeight}g</p>
                        <p class="mb-1"><strong>Eficiencia:</strong> <span class="badge bg-success">${stats.efficiency}</span></p>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <p class="mb-1"><strong>Special:</strong></p>
                            <p class="mb-1"><strong>Super Lump:</strong></p>
                            <p class="mb-1"><strong>Jumbo:</strong></p>
                            <p class="mb-1"><strong>Claw Meat:</strong></p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1 text-primary">${yield.special}g</p>
                            <p class="mb-1 text-success">${yield.superLump}g</p>
                            <p class="mb-1 text-warning">${yield.jumbo}g</p>
                            <p class="mb-1 text-danger">${yield.clawMeat}g</p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-6">
                            <p class="mb-1"><strong>Total Carne:</strong></p>
                            <p class="mb-1"><strong>Desechos:</strong></p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1 text-secondary">${yield.totalMeat}g</p>
                            <p class="mb-1 text-dark">${yield.waste}g</p>
                        </div>
                    </div>
                `;
            }
        }
    });
    
    // Crear comparación visual
    createComparisonChart();
}

// Función para crear gráfico de comparación
function createComparisonChart() {
    const container = document.getElementById('comparisonChart');
    if (!container) return;
    
    const crabTypes = ['azul', 'roja', 'verde'];
    const efficiencies = [];
    const names = [];
    
    crabTypes.forEach(type => {
        const stats = ConfigUtils.getYieldStatistics(type);
        if (stats) {
            efficiencies.push(parseFloat(stats.efficiency));
            names.push(stats.name);
        }
    });
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-center mb-3">Eficiencia por Tipo</h6>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${names[0]}</span>
                    <div class="progress flex-grow-1 mx-2" style="height: 20px;">
                        <div class="progress-bar bg-primary" style="width: ${efficiencies[0]}%">${efficiencies[0]}%</div>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${names[1]}</span>
                    <div class="progress flex-grow-1 mx-2" style="height: 20px;">
                        <div class="progress-bar bg-danger" style="width: ${efficiencies[1]}%">${efficiencies[1]}%</div>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${names[2]}</span>
                    <div class="progress flex-grow-1 mx-2" style="height: 20px;">
                        <div class="progress-bar bg-success" style="width: ${efficiencies[2]}%">${efficiencies[2]}%</div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="text-center mb-3">Resumen</h6>
                <div class="alert alert-info">
                    <p class="mb-1"><strong>Mejor Rendimiento:</strong> ${names[efficiencies.indexOf(Math.max(...efficiencies))]}</p>
                    <p class="mb-1"><strong>Mayor Special:</strong> Cangreja Roja (34%)</p>
                    <p class="mb-1"><strong>Mayor Super Lump:</strong> Cangreja Verde (40%)</p>
                    <p class="mb-1"><strong>Mayor Jumbo:</strong> Cangreja Roja (26%)</p>
                    <p class="mb-0"><strong>Mayor Claw Meat:</strong> Cangreja Azul (7%)</p>
                </div>
            </div>
        </div>
    `;
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

// Exportar funciones para uso global
window.openPhase1 = openPhase1;
window.savePhase1 = savePhase1;
window.openPhase1Review = openPhase1Review;
window.approveContainer = approveContainer;
window.rejectContainer = rejectContainer;
window.calculateYield = calculateYield;
window.calculateTotalYield = calculateTotalYield;
window.showYieldStatistics = showYieldStatistics;
window.logout = logout; 
