# Sistema de Clasificación Automática por Rendimiento

## Descripción
Sistema automatizado para clasificar cargamentos de cangrejas basado en el porcentaje de materia prima comestible obtenida después del proceso de separación de carne.

## Criterios de Clasificación

### Clase A - Excelente Rendimiento
- **Porcentaje de Materia Prima Comestible:** > 50%
- **Descripción:** Cargamentos con excelente rendimiento de carne
- **Color:** Verde (bg-success)
- **Criterio:** Más del 50% del peso total se convierte en carne comestible

### Clase B - Rendimiento Aceptable
- **Porcentaje de Materia Prima Comestible:** 40% - 50%
- **Descripción:** Cargamentos con rendimiento aceptable de carne
- **Color:** Amarillo (bg-warning)
- **Criterio:** Entre 40% y 50% del peso total se convierte en carne comestible

### Clase C - Rendimiento Bajo
- **Porcentaje de Materia Prima Comestible:** < 40%
- **Descripción:** Cargamentos con rendimiento bajo de carne
- **Color:** Rojo (bg-danger)
- **Criterio:** Menos del 40% del peso total se convierte en carne comestible

## Cálculo de Materia Prima Comestible

### Fórmula
```
Materia Prima Comestible (%) = (Total Carne / Peso Total Ajustado) × 100
```

### Componentes
- **Total Carne:** Suma de Special + Super Lump + Jumbo + Claw Meat
- **Peso Total Ajustado:** Peso original × multiplicador de estado
- **Multiplicadores de Estado:**
  - Vivo: 0.95 (menos desechos)
  - Muerto: 1.15 (más desechos)
  - Normal: 1.0 (rendimiento estándar)

## Funciones del Sistema

### `ConfigUtils.autoClassifyByYield(crabType, weight, status)`
Clasifica automáticamente un cargamento basado en su rendimiento.

**Parámetros:**
- `crabType`: Tipo de cangreja (azul, roja, verde)
- `weight`: Peso en kilogramos
- `status`: Estado (viva, muerta, normal)

**Retorna:**
```javascript
{
    classification: "A",           // Clase asignada
    reason: "Materia prima comestible: 87.0% (Excelente rendimiento)",
    ediblePercentage: "87.0",     // Porcentaje de materia prima comestible
    totalMeat: "870.00",          // kg total de carne
    totalWeight: "1000.00",       // kg total ajustado
    yield: { /* datos de rendimiento */ }
}
```

### `ConfigUtils.getClassificationInfo(classification)`
Obtiene información detallada sobre una clasificación.

**Parámetros:**
- `classification`: Clase (A, B, C)

**Retorna:**
```javascript
{
    class: "A",
    name: "Clase A",
    description: "Excelente calidad",
    color: "#28a745",
    minEdiblePercentage: 50,
    maxEdiblePercentage: 100
}
```

## Ejemplos de Clasificación

### Ejemplo 1: Cangreja Azul Viva
- **Peso:** 1000g
- **Estado:** Viva (multiplicador: 0.95)
- **Peso Ajustado:** 950g
- **Total Carne:** 826.5g
- **Materia Prima Comestible:** 87.0%
- **Clasificación:** Clase A (Excelente)

### Ejemplo 2: Cangreja Roja Muerta
- **Peso:** 1000g
- **Estado:** Muerta (multiplicador: 1.15)
- **Peso Ajustado:** 1150g
- **Total Carne:** 954.5g
- **Materia Prima Comestible:** 83.0%
- **Clasificación:** Clase A (Excelente)

### Ejemplo 3: Cangreja Verde con Bajo Rendimiento
- **Peso:** 1000g
- **Estado:** Muerta (multiplicador: 1.15)
- **Peso Ajustado:** 1150g
- **Total Carne:** 425.5g
- **Materia Prima Comestible:** 37.0%
- **Clasificación:** Clase C (Bajo)

## Interfaz de Usuario

### Formulario de Recepción
- **Campo de Clasificación:** Campo de solo lectura con botón de cálculo
- **Cálculo Automático:** Se ejecuta al cambiar tipo, peso o estado
- **Visualización:** Color del campo cambia según la clasificación
- **Información:** Muestra razón de la clasificación

### Información de Clasificación
- **Sección Informativa:** Explica los criterios de cada clase
- **Badges de Estado:** Verde (A), Amarillo (B), Rojo (C)
- **Descripciones:** Excelente, Aceptable, Bajo

## Rendimiento por Tipo de Cangreja

### Cangreja Azul
- **Eficiencia Base:** 87%
- **Clasificación Típica:** Clase A
- **Características:** Mejor rendimiento general

### Cangreja Roja
- **Eficiencia Base:** 83%
- **Clasificación Típica:** Clase A
- **Características:** Alto rendimiento en Special

### Cangreja Verde
- **Eficiencia Base:** 83%
- **Clasificación Típica:** Clase A
- **Características:** Alto rendimiento en Super Lump

## Validaciones del Sistema

### Validación de Datos
- Todos los campos deben estar completos
- Peso debe ser mayor a 0
- Estado debe ser válido (viva, muerta, normal)
- Tipo de cangreja debe ser válido

### Validación de Clasificación
- Clasificación automática se ejecuta al guardar
- Si no hay clasificación manual, se calcula automáticamente
- Se guardan datos adicionales de clasificación

## Datos Guardados

### Información de Clasificación
```javascript
{
    classification: "A",
    classificationData: {
        classification: "A",
        reason: "Materia prima comestible: 87.0% (Excelente rendimiento)",
        ediblePercentage: "87.0",
        totalMeat: "870.00",
        totalWeight: "1000.00"
    },
    ediblePercentage: "87.0",
    classificationReason: "Materia prima comestible: 87.0% (Excelente rendimiento)"
}
```

## Archivos Modificados

1. **config.js** - Funciones de clasificación automática
2. **operador.html** - Interfaz de clasificación automática
3. **operador-script.js** - Lógica de clasificación automática
4. **AUTO_CLASSIFICATION_SYSTEM.md** - Documentación del sistema

## Pruebas Recomendadas

1. **Cangreja Azul Viva** → Debe clasificar como Clase A
2. **Cangreja Roja Muerta** → Debe clasificar como Clase A
3. **Cangreja Verde con bajo rendimiento** → Debe clasificar como Clase C
4. **Cálculo automático** → Debe ejecutarse al cambiar campos
5. **Validación de datos** → Debe requerir todos los campos

## Troubleshooting

### Problema: No se calcula la clasificación
**Solución:** Verificar que todos los campos (tipo, peso, estado) estén completos

### Problema: Clasificación incorrecta
**Solución:** Verificar que el peso esté en kilogramos y no en gramos

### Problema: No se actualiza automáticamente
**Solución:** Verificar que los event listeners estén configurados correctamente

### Problema: Color de clasificación no cambia
**Solución:** Verificar que las clases CSS estén definidas correctamente 