# Sistema de Cálculo de Rendimiento de Carne de Cangreja

## Descripción
Sistema automatizado para calcular el rendimiento de carne de cangreja basado en el tipo de cangreja, peso y estado (vivo/muerto). El sistema considera los diferentes porcentajes de rendimiento para cada tipo de carne extraída.

## Tipos de Cangreja y Sus Rendimientos

### Cangreja Azul (Callinectes sapidus)
- **Peso Promedio:** 200g
- **Temperatura Preferida:** 85°C
- **Rendimiento por 1000g:**
  - Special: 27% (270g)
  - Super Lump: 35% (350g)
  - Jumbo: 18% (180g)
  - Claw Meat: 7% (70g)
  - Desechos: 13% (130g)
  - **Eficiencia:** 87%

### Cangreja Roja (Callinectes danae)
- **Peso Promedio:** 180g
- **Temperatura Preferida:** 82°C
- **Rendimiento por 1000g:**
  - Special: 34% (340g)
  - Super Lump: 19% (190g)
  - Jumbo: 26% (260g)
  - Claw Meat: 4% (40g)
  - Desechos: 17% (170g)
  - **Eficiencia:** 83%

### Cangreja Verde (Callinectes bocourti)
- **Peso Promedio:** 160g
- **Temperatura Preferida:** 80°C
- **Rendimiento por 1000g:**
  - Special: 20% (200g)
  - Super Lump: 40% (400g)
  - Jumbo: 18% (180g)
  - Claw Meat: 5% (50g)
  - Desechos: 17% (170g)
  - **Eficiencia:** 83%

## Factores de Ajuste por Estado

### Cangrejos Vivos
- **Multiplicador:** 0.95 (95%)
- **Efecto:** Generan menos desechos
- **Razón:** Mejor calidad de carne, menos pérdida por deterioro

### Cangrejos Muertos
- **Multiplicador:** 1.15 (115%)
- **Efecto:** Generan más desechos
- **Razón:** Deterioro de la carne, mayor pérdida por descomposición

### Cangrejos en Estado Normal
- **Multiplicador:** 1.0 (100%)
- **Efecto:** Rendimiento estándar
- **Razón:** Estado base para cálculos

## Funciones del Sistema

### `ConfigUtils.calculateMeatYield(crabType, weight, status)`
Calcula el rendimiento de carne basado en los parámetros proporcionados.

**Parámetros:**
- `crabType`: Tipo de cangreja (azul, roja, verde)
- `weight`: Peso en kilogramos
- `status`: Estado (viva, muerta, normal)

**Retorna:**
```javascript
{
    special: "270.00",        // kg de special
    superLump: "350.00",      // kg de super lump
    jumbo: "180.00",          // kg de jumbo
    clawMeat: "70.00",        // kg de claw meat
    waste: "130.00",          // kg de desechos
    totalMeat: "870.00",      // kg total de carne
    totalWeight: "1000.00",   // kg total ajustado
    efficiency: "87.0%"       // porcentaje de eficiencia
}
```

### `ConfigUtils.getYieldStatistics(crabType)`
Obtiene estadísticas de rendimiento para un tipo específico de cangreja.

**Parámetros:**
- `crabType`: Tipo de cangreja

**Retorna:**
```javascript
{
    type: "azul",
    name: "Cangreja Azul",
    averageWeight: 200,
    yieldRates: {
        special: 0.27,
        superLump: 0.35,
        jumbo: 0.18,
        clawMeat: 0.07,
        waste: 0.13
    },
    efficiency: "87.0%"
}
```

### `ConfigUtils.getEstimatedYield(crabType, weight)`
Calcula rendimiento estimado para un peso específico sin ajustes de estado.

**Parámetros:**
- `crabType`: Tipo de cangreja
- `weight`: Peso en gramos

**Retorna:**
```javascript
{
    weight: 1000,
    special: "270.00",
    superLump: "350.00",
    jumbo: "180.00",
    clawMeat: "70.00",
    waste: "130.00",
    totalMeat: "870.00"
}
```

## Interfaz de Usuario

### Formulario de Recepción (Operador)
- **Cálculo Automático:** Se actualiza en tiempo real
- **Campos que activan cálculo:**
  - Tipo de cangreja
  - Peso
  - Estado (vivo/muerto)
- **Visualización:**
  - Badges con colores diferenciados
  - Valores en kilogramos
  - Porcentaje de eficiencia

### Estadísticas de Rendimiento
- **Modal de Comparación:** Muestra rendimiento por tipo
- **Gráficos de Progreso:** Visualización de eficiencia
- **Resumen Comparativo:** Mejores rendimientos por categoría

## Ejemplos de Cálculo

### Ejemplo 1: Cangreja Azul Viva
- **Peso:** 1000g
- **Estado:** Viva (multiplicador: 0.95)
- **Peso Ajustado:** 950g
- **Resultado:**
  - Special: 256.5g
  - Super Lump: 332.5g
  - Jumbo: 171g
  - Claw Meat: 66.5g
  - Desechos: 123.5g
  - Total Carne: 826.5g

### Ejemplo 2: Cangreja Roja Muerta
- **Peso:** 1000g
- **Estado:** Muerta (multiplicador: 1.15)
- **Peso Ajustado:** 1150g
- **Resultado:**
  - Special: 391g
  - Super Lump: 218.5g
  - Jumbo: 299g
  - Claw Meat: 46g
  - Desechos: 195.5g
  - Total Carne: 954.5g

## Comparación de Eficiencia

### Por Tipo de Carne:
1. **Special:** Cangreja Roja (34%) > Cangreja Azul (27%) > Cangreja Verde (20%)
2. **Super Lump:** Cangreja Verde (40%) > Cangreja Azul (35%) > Cangreja Roja (19%)
3. **Jumbo:** Cangreja Roja (26%) > Cangreja Azul (18%) = Cangreja Verde (18%)
4. **Claw Meat:** Cangreja Azul (7%) > Cangreja Verde (5%) > Cangreja Roja (4%)

### Por Eficiencia Total:
1. **Cangreja Azul:** 87% (mejor eficiencia)
2. **Cangreja Roja:** 83%
3. **Cangreja Verde:** 83%

## Archivos Modificados

1. **config.js** - Configuración de rendimiento por tipo
2. **operador.html** - Interfaz de cálculo automático
3. **operador-script.js** - Funciones de cálculo y visualización
4. **YIELD_CALCULATION_SYSTEM.md** - Documentación del sistema

## Pruebas Recomendadas

1. **Cálculo con cangrejos vivos** → Debe mostrar menor peso total
2. **Cálculo con cangrejos muertos** → Debe mostrar mayor peso total
3. **Comparación entre tipos** → Debe mostrar diferencias en rendimiento
4. **Actualización automática** → Debe recalcular al cambiar campos
5. **Estadísticas de comparación** → Debe mostrar gráficos correctos

## Troubleshooting

### Problema: No se calcula el rendimiento
**Solución:** Verificar que todos los campos (tipo, peso, estado) estén completos

### Problema: Valores incorrectos
**Solución:** Verificar que el peso esté en kilogramos y no en gramos

### Problema: No se actualiza automáticamente
**Solución:** Verificar que los event listeners estén configurados correctamente

### Problema: Estadísticas no se muestran
**Solución:** Verificar que ConfigUtils esté disponible globalmente 