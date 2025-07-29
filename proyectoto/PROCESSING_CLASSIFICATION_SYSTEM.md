# Sistema de Clasificación Automática en Procesamiento

## Descripción
Sistema automatizado para calcular rendimiento y clasificar cargamentos DURANTE el proceso de separación de carne en la **Fase 3**, basado en los resultados reales obtenidos.

## Flujo del Sistema

### Fase 1 - Recepción (Operador)
- **Función:** Registro básico de cargamento
- **Datos:** Tipo, peso, estado, clasificación manual
- **Clasificación:** Manual (A, B, C) - NO automática
- **Propósito:** Preparar datos para procesamiento

### Fase 2 - Procesamiento (Supervisor)
- **Función:** Control de cocción y procesamiento inicial
- **Datos:** Temperatura, tiempo, calidad del proceso
- **Clasificación:** NO automática
- **Propósito:** Supervisar el proceso de cocción

### Fase 3 - Separación de Carne (Supervisor)
- **Función:** Separación de carne y cálculo de rendimiento
- **Datos:** Cantidades reales de cada tipo de carne
- **Clasificación:** Automática basada en resultados reales
- **Propósito:** Determinar clasificación final según rendimiento

## Cálculo de Rendimiento en Fase 3

### Datos de Entrada
- **Special Meat:** Cantidad real obtenida (kg)
- **Super Lump:** Cantidad real obtenida (kg)
- **Jumbo:** Cantidad real obtenida (kg)
- **Claw Meat:** Cantidad real obtenida (kg)
- **Organic Waste:** Desechos reales (kg)

### Cálculos Automáticos
```javascript
Total Carne = Special + Super Lump + Jumbo + Claw Meat
Total Procesado = Total Carne + Desechos
Materia Prima Comestible (%) = (Total Carne / Total Procesado) × 100
```

### Clasificación Automática
- **Clase A:** Materia prima comestible > 50%
- **Clase B:** Materia prima comestible 40% - 50%
- **Clase C:** Materia prima comestible < 40%

## Interfaz de Usuario

### Formulario de Separación de Carne (Fase 3)
- **Campos de Entrada:** Cantidades reales de cada tipo
- **Cálculo Automático:** Total procesado se actualiza en tiempo real
- **Visualización:** Badges con cantidades y porcentajes

### Sección de Rendimiento
- **Special:** Badge azul con cantidad
- **Super Lump:** Badge verde con cantidad
- **Jumbo:** Badge amarillo con cantidad
- **Claw Meat:** Badge rojo con cantidad
- **Total Carne:** Badge gris con suma
- **Desechos:** Badge negro con cantidad
- **Materia Prima Comestible:** Badge amarillo con porcentaje

### Clasificación Automática
- **Botón de Cálculo:** "Calcular Clasificación"
- **Visualización:** Badge con clase y color
- **Razón:** Explicación detallada del resultado
- **Guardado:** Clasificación final se guarda automáticamente

## Funciones del Sistema

### `openPhase3()`
Abre el modal de la Fase 3 y carga datos del contenedor aprobado.

**Comportamiento:**
- Busca contenedores aprobados para procesamiento
- Carga datos originales del contenedor
- Limpia campos de separación
- Muestra modal de Fase 3

### `calculateTotal3()`
Calcula el total procesado y actualiza visualización de rendimiento.

**Comportamiento:**
- Suma todas las cantidades de carne y desechos
- Actualiza campo de total procesado
- Llama a `updatePhase3YieldDisplay()`

### `updatePhase3YieldDisplay(special, superLump, jumbo, clawMeat, waste, total)`
Actualiza la visualización de rendimiento en tiempo real.

**Parámetros:**
- `special`: Cantidad de Special Meat
- `superLump`: Cantidad de Super Lump
- `jumbo`: Cantidad de Jumbo
- `clawMeat`: Cantidad de Claw Meat
- `waste`: Cantidad de desechos
- `total`: Total procesado

**Comportamiento:**
- Actualiza badges con cantidades
- Calcula porcentaje de materia prima comestible
- Muestra resultados en tiempo real

### `calculatePhase3Classification()`
Calcula la clasificación automática basada en resultados reales.

**Comportamiento:**
- Obtiene cantidades reales de separación
- Calcula porcentaje de materia prima comestible
- Determina clasificación según criterios
- Actualiza visualización
- Muestra alerta informativa

### `savePhase3()`
Guarda la clasificación final y actualiza el sistema.

**Comportamiento:**
- Valida formulario
- Calcula clasificación final
- Guarda datos en localStorage
- Actualiza contenedor original
- Cierra modal y actualiza dashboard

## Ejemplos de Clasificación

### Ejemplo 1: Excelente Rendimiento
- **Special:** 15.0 kg
- **Super Lump:** 20.0 kg
- **Jumbo:** 25.0 kg
- **Claw Meat:** 10.0 kg
- **Desechos:** 30.0 kg
- **Total Carne:** 70.0 kg
- **Total Procesado:** 100.0 kg
- **Materia Prima Comestible:** 70.0%
- **Clasificación:** Clase A (Excelente)

### Ejemplo 2: Rendimiento Aceptable
- **Special:** 12.0 kg
- **Super Lump:** 15.0 kg
- **Jumbo:** 18.0 kg
- **Claw Meat:** 8.0 kg
- **Desechos:** 47.0 kg
- **Total Carne:** 53.0 kg
- **Total Procesado:** 100.0 kg
- **Materia Prima Comestible:** 53.0%
- **Clasificación:** Clase A (Excelente)

### Ejemplo 3: Rendimiento Bajo
- **Special:** 8.0 kg
- **Super Lump:** 10.0 kg
- **Jumbo:** 12.0 kg
- **Claw Meat:** 5.0 kg
- **Desechos:** 65.0 kg
- **Total Carne:** 35.0 kg
- **Total Procesado:** 100.0 kg
- **Materia Prima Comestible:** 35.0%
- **Clasificación:** Clase C (Bajo)

## Ventajas del Sistema

### Precisión
- Basado en resultados reales de separación
- No depende de estimaciones previas
- Considera eficiencia real del proceso

### Transparencia
- Cálculos visibles en tiempo real
- Razones claras de clasificación
- Trazabilidad completa del proceso

### Eficiencia
- Cálculo automático al cambiar datos
- Clasificación instantánea
- Actualización automática de campos

## Archivos Modificados

1. **operador.html** - Quitada clasificación automática de Fase 1
2. **operador-script.js** - Simplificado para solo registro básico
3. **supervisor.html** - Añadida Fase 3 con separación de carne
4. **supervisor-script.js** - Funciones de cálculo y clasificación automática en Fase 3
5. **PROCESSING_CLASSIFICATION_SYSTEM.md** - Documentación actualizada

## Pruebas Recomendadas

1. **Registro en Fase 1** → Solo datos básicos, sin clasificación automática
2. **Procesamiento en Fase 2** → Control de cocción y calidad
3. **Separación en Fase 3** → Cálculo automático de rendimiento
4. **Clasificación automática** → Basada en resultados reales
5. **Validación de datos** → Verificar cálculos correctos

## Troubleshooting

### Problema: No se puede acceder a Fase 3
**Solución:** Verificar que hay contenedores aprobados en Fase 1

### Problema: No se calcula el rendimiento
**Solución:** Verificar que todos los campos de separación tengan valores

### Problema: Clasificación incorrecta
**Solución:** Verificar que las cantidades estén en kilogramos

### Problema: No se actualiza automáticamente
**Solución:** Verificar que los event listeners estén configurados

### Problema: No se guarda la clasificación
**Solución:** Verificar que la función savePhase3 esté disponible 