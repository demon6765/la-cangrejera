# Sistema de Gestión de Cangrejas - Maracaibo

## Descripción
Sistema web completo para la automatización del proceso de clasificación y procesamiento de cangrejas en una empresa con sucursales en zona sur y zona norte de Maracaibo.

## Características Principales

### 🔐 Sistema de Seguridad
- **4 Niveles de Acceso:**
  - **Operador Receptor** (Nivel 1): Solo Fase 1
  - **Supervisor de Calidad** (Nivel 2): Fases 1 y 2
  - **Gerente de Proceso** (Nivel 3): Todas las fases
  - **Administrador** (Nivel 4): Acceso completo + administración

### 📋 Tres Fases del Proceso

#### **Fase 1: Recepción de Mercancía**
- Clasificación por tipo de cangreja (Azul, Roja, Verde)
- Control de peso y cantidad
- Verificación de estado (vivas/muertas)
- Clasificación A/B/C según calidad
- Generación automática de informes de devolución para cangrejas muertas

#### **Fase 2: Procesamiento**
- Control de temperatura de cocción
- Tiempo de procesamiento
- Rendimiento de carne
- Control de desperdicios
- Clasificación final de calidad
- Notas de calidad

#### **Fase 3: Exportación**
- Tipo de empaque
- Peso neto
- Destino de exportación
- Método de transporte
- Estado de envío
- Fecha de despacho

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar Bootstrap y Font Awesome)

### Instalación
1. Descargar los archivos `index.html` y `script.js`
2. Colocar ambos archivos en la misma carpeta
3. Abrir `index.html` en el navegador

### Uso del Sistema

#### **Inicio de Sesión**
1. Ingresar nombre de usuario
2. Contraseña (mínimo 4 caracteres)
3. Seleccionar nivel de seguridad
4. Hacer clic en "Iniciar Sesión"

#### **Dashboard Principal**
- **Estadísticas en tiempo real:** Total de contenedores, clasificaciones A/B/C
- **Tarjetas de fases:** Acceso directo a cada fase del proceso
- **Indicadores de seguridad:** Nivel de acceso visible en cada fase

#### **Gestión de Fases**

**Fase 1 - Recepción:**
- ID de contenedor automático
- Datos del proveedor
- Clasificación detallada
- Validación de estado
- Observaciones

**Fase 2 - Procesamiento:**
- Selección de contenedores de Fase 1
- Control de parámetros de cocción
- Métricas de calidad
- Validaciones automáticas

**Fase 3 - Exportación:**
- Selección de contenedores procesados
- Configuración de envío
- Control de empaque
- Seguimiento de estado

## 🔧 Funcionalidades Avanzadas

### **Persistencia de Datos**
- Almacenamiento local en navegador
- Respaldo automático de datos
- Restauración de información

### **Reportes y Exportación**
- Generación de reportes JSON
- Estadísticas detalladas
- Exportación de datos

### **Validaciones de Seguridad**
- Control de acceso por nivel
- Validaciones de calidad
- Confirmaciones para casos críticos

### **Interfaz Responsiva**
- Diseño moderno y profesional
- Compatible con dispositivos móviles
- Navegación intuitiva

## 📊 Estructura de Datos

### **Contenedores**
```json
{
  "id": "timestamp",
  "containerNumber": "CONT-1234567890",
  "provider": "Proveedor XYZ",
  "type": "azul|roja|verde",
  "weight": 150.5,
  "status": "viva|muerta",
  "classification": "A|B|C",
  "phase": 1|2|3
}
```

### **Fase 1 - Recepción**
```json
{
  "id": "timestamp",
  "containerNumber": "CONT-1234567890",
  "provider": "Proveedor XYZ",
  "crabType": "azul",
  "size": "grande",
  "weight": 150.5,
  "quantity": 100,
  "status": "viva",
  "classification": "A",
  "observations": "Calidad excelente",
  "phase": 1,
  "date": "2024-01-01T10:00:00.000Z",
  "operator": "usuario"
}
```

### **Fase 2 - Procesamiento**
```json
{
  "id": "timestamp",
  "containerId": "CONT-1234567890",
  "cookingTemp": 85,
  "cookingTime": 15,
  "coolingTemp": 4,
  "meatYield": 75.5,
  "waste": 25.0,
  "finalQuality": "A",
  "processStatus": "completado",
  "qualityNotes": "Proceso exitoso",
  "phase": 2,
  "date": "2024-01-01T11:00:00.000Z",
  "operator": "usuario"
}
```

### **Fase 3 - Exportación**
```json
{
  "id": "timestamp",
  "containerId": "CONT-1234567890",
  "packagingType": "caja",
  "netWeight": 75.5,
  "packageCount": 50,
  "destination": "Estados Unidos",
  "shippingDate": "2024-01-02",
  "transportMethod": "maritimo",
  "shippingStatus": "preparado",
  "shippingNotes": "Listo para envío",
  "phase": 3,
  "date": "2024-01-01T12:00:00.000Z",
  "operator": "usuario"
}
```

## 🛡️ Seguridad y Validaciones

### **Niveles de Acceso**
- **Operador:** Solo puede registrar recepción
- **Supervisor:** Puede procesar y controlar calidad
- **Gerente:** Acceso completo al proceso
- **Admin:** Control total + administración

### **Validaciones Automáticas**
- Cangrejas muertas → Informe de devolución
- Rendimiento bajo → Advertencia
- Desperdicio alto → Confirmación
- Datos incompletos → Bloqueo de guardado

## 📱 Atajos de Teclado
- `Ctrl + 1`: Abrir Fase 1
- `Ctrl + 2`: Abrir Fase 2
- `Ctrl + 3`: Abrir Fase 3

## 🔄 Mantenimiento

### **Respaldo de Datos**
- Función de respaldo automático
- Exportación en formato JSON
- Restauración desde archivo

### **Limpieza de Datos**
- Solo administradores
- Confirmación requerida
- Eliminación completa

## 🎨 Tecnologías Utilizadas

- **HTML5:** Estructura semántica
- **CSS3:** Diseño moderno y responsivo
- **JavaScript ES6+:** Lógica de aplicación
- **Bootstrap 5:** Framework de UI
- **Font Awesome:** Iconografía
- **LocalStorage:** Persistencia de datos

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema:
- Revisar la documentación técnica
- Verificar permisos de usuario
- Comprobar datos de entrada
- Validar formato de archivos

## 🔄 Versiones

### v1.0.0 (Actual)
- Sistema completo de gestión
- Tres fases implementadas
- Sistema de seguridad
- Interfaz responsiva
- Persistencia de datos

---

**Desarrollado para la empresa de cangrejas de Maracaibo**
*Sistema de Gestión Integral - 2024* 