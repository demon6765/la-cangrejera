# Sistema de Aprobación de Contenedores

## Descripción
El sistema de aprobación permite controlar el flujo de contenedores entre las diferentes fases del proceso de gestión de cangrejas. **NUEVO**: Ahora todos los roles principales (Gerente de Proceso, Operador Receptor y Administrador) pueden aprobar o rechazar contenedores.

## Flujo de Aprobación

### 1. Fase 1 - Recepción (Operador)
- **Acción**: El operador registra la recepción de contenedores
- **Estado**: Pendiente de aprobación
- **NUEVO**: El operador también puede aprobar/rechazar contenedores

### 2. Aprobación - Todos los Roles
- **Acción**: Revisar y aprobar/rechazar contenedores de Fase 1
- **Estados posibles**:
  - ✅ **Aprobado**: Listo para procesamiento
  - ❌ **Rechazado**: No cumple estándares
  - ⏳ **Pendiente**: Esperando revisión

### 3. Fase 2 - Procesamiento
- **Acción**: Solo contenedores aprobados pueden pasar a procesamiento
- **Validación**: Sistema verifica estado de aprobación

### 4. Fase 3 - Exportación
- **Acción**: Solo contenedores procesados pueden exportarse
- **Validación**: Sistema verifica estado de procesamiento

## Roles y Permisos Actualizados

### Operador Receptor
- ✅ Registrar recepciones
- ✅ **NUEVO**: Aprobar/rechazar contenedores
- ✅ **NUEVO**: Revisar estado de contenedores
- ❌ No puede acceder a Fase 2

### Supervisor de Calidad
- ✅ Revisar recepciones
- ✅ Aprobar/rechazar contenedores
- ✅ Acceder a Fase 2 (solo contenedores aprobados)
- ❌ No puede acceder a Fase 3

### Gerente de Proceso
- ✅ Todas las funciones del supervisor
- ✅ Aprobación automática (bypass supervisor)
- ✅ Acceso completo a todas las fases
- ✅ Aprobación en lote
- ✅ **NUEVO**: Interfaz mejorada de revisión

### Administrador
- ✅ Acceso completo sin restricciones
- ✅ Aprobación automática
- ✅ Gestión del sistema
- ✅ **NUEVO**: Revisión de contenedores con logs del sistema
- ✅ **NUEVO**: Aprobación con registro de auditoría

## Funciones de Aprobación

### `openPhase1Review()`
Abre el modal de revisión de contenedores para todos los roles.

**Comportamiento:**
- Carga todos los contenedores de Fase 1
- Muestra estado de aprobación
- Permite acciones de aprobar/rechazar

### `approveContainer(containerNumber)`
Aprobar un contenedor específico para procesamiento.

**Parámetros:**
- `containerNumber`: Número del contenedor

**Comportamiento:**
- Marca el contenedor como `approvedForProcessing = true`
- Registra el usuario que aprobó
- Registra la fecha de aprobación
- Actualiza el dashboard
- **Admin**: Añade log del sistema

### `rejectContainer(containerNumber)`
Rechazar un contenedor específico.

**Parámetros:**
- `containerNumber`: Número del contenedor

**Comportamiento:**
- Solicita razón del rechazo
- Marca el contenedor como `rejected = true`
- Registra razón, usuario y fecha
- Actualiza el dashboard
- **Admin**: Añade log del sistema

### `bulkApprove()` (Solo Gerente/Admin)
Aprobar múltiples contenedores pendientes de una vez.

**Comportamiento:**
- Identifica todos los contenedores pendientes
- Aprobación masiva con confirmación
- Marca como aprobación automática

## Estados de Contenedores

### En Fase 1
```javascript
{
    approvedForProcessing: false,  // Pendiente
    rejected: false,               // No rechazado
    approvedBy: null,              // No aprobado aún
    approvalDate: null,            // Sin fecha de aprobación
    rejectionReason: null,         // Sin razón de rechazo
    rejectedBy: null,              // No rechazado aún
    rejectionDate: null            // Sin fecha de rechazo
}
```

### Aprobado
```javascript
{
    approvedForProcessing: true,   // Aprobado
    approvedBy: "usuario",         // Quién aprobó
    approvalDate: "2024-01-01T10:00:00.000Z", // Cuándo
    autoApproved: false            // Aprobación manual
}
```

### Rechazado
```javascript
{
    rejected: true,                // Rechazado
    rejectionReason: "Razón",      // Por qué
    rejectedBy: "usuario",         // Quién rechazó
    rejectionDate: "2024-01-01T10:00:00.000Z" // Cuándo
}
```

## Validaciones del Sistema

### Al Abrir Fase 2
```javascript
const availableContainers = phase1Data.filter(item => 
    !item.rejected && 
    (item.approvedForProcessing || currentSecurityLevel === 'admin' || currentSecurityLevel === 'gerente')
);
```

### Al Abrir Fase 3
```javascript
const availableContainers = phase2Data.filter(item => 
    item.processStatus === 'completado'
);
```

## Mensajes de Error

### Sin Contenedores Aprobados
```
"No hay contenedores aprobados para procesar. Los contenedores deben ser aprobados por un supervisor antes de pasar a procesamiento."
```

### Sin Contenedores Procesados
```
"No hay contenedores procesados disponibles para exportar"
```

## Dashboard Updates

### Operador Receptor
- Total procesados
- Clase A
- Rechazados
- **NUEVO**: Estado de aprobación en tabla de contenedores recientes

### Supervisor
- Total recibidos
- En procesamiento
- Completados
- Rechazados
- Aprobados
- Pendientes

### Gerente
- Todas las estadísticas del supervisor
- Aprobados en lote
- Estadísticas de aprobación
- **NUEVO**: Interfaz mejorada de revisión

### Administrador
- Todas las estadísticas del gerente
- Logs del sistema
- **NUEVO**: Revisión con auditoría completa

## Archivos Modificados

1. **gerente.html** - Añadido modal de revisión y botones de aprobación
2. **gerente-script.js** - Funciones de aprobación para gerente
3. **operador.html** - Añadido modal de revisión y botones de aprobación
4. **operador-script.js** - Funciones de aprobación para operador
5. **admin.html** - Añadido modal de revisión y botón de aprobación
6. **admin-script.js** - Funciones de aprobación para administrador con logs

## Nuevas Funcionalidades

### Interfaz de Revisión
- Modal dedicado para cada rol
- Tabla con estado de aprobación visual
- Botones de acción contextuales
- Información detallada de cada contenedor

### Logs de Auditoría (Admin)
- Registro de todas las acciones de aprobación
- Razones de rechazo documentadas
- Trazabilidad completa de decisiones

### Aprobación en Lote (Gerente)
- Aprobación masiva de contenedores pendientes
- Confirmación antes de ejecutar
- Eficiencia en el proceso de revisión

## Pruebas Recomendadas

1. **Operador registra contenedor** → Debe aparecer como pendiente
2. **Operador aprueba contenedor** → Debe aparecer como aprobado
3. **Operador rechaza contenedor** → Debe aparecer como rechazado
4. **Gerente abre Fase 2** → Solo debe ver contenedores aprobados
5. **Admin aprueba automáticamente** → Debe saltar aprobación manual
6. **Aprobación en lote** → Debe aprobar múltiples contenedores
7. **Admin revisa logs** → Debe ver todas las acciones de aprobación

## Troubleshooting

### Problema: No puedo aprobar contenedores
**Solución**: Verificar que tienes permisos de operador, supervisor, gerente o admin

### Problema: No aparecen contenedores en Fase 2
**Solución**: Verificar que los contenedores estén aprobados

### Problema: No aparecen contenedores en Fase 3
**Solución**: Verificar que los contenedores estén procesados (status: 'completado')

### Problema: No veo el botón de revisión
**Solución**: Verificar que estás en el rol correcto y que el modal está cargado

### Problema: Los logs no se registran (Admin)
**Solución**: Verificar que la función addSystemLog está funcionando correctamente 