// Configuración del Sistema de Gestión de Cangrejas
const SYSTEM_CONFIG = {
    // Configuración de la empresa
    company: {
        name: "Empresa de Cangrejas Maracaibo",
        location: {
            south: "Sucursal Zona Sur",
            north: "Sucursal Zona Norte"
        },
        contact: {
            phone: "+58 261-XXX-XXXX",
            email: "info@cangrejasmaracaibo.com"
        }
    },

    // Configuración de clasificación
    classification: {
        classA: {
            name: "Clase A",
            description: "Excelente calidad, tamaño grande, peso óptimo",
            minWeight: 150,
            color: "#28a745"
        },
        classB: {
            name: "Clase B",
            description: "Buena calidad, tamaño mediano, peso aceptable",
            minWeight: 100,
            maxWeight: 149,
            color: "#ffc107"
        },
        classC: {
            name: "Clase C",
            description: "Calidad básica, tamaño pequeño, peso mínimo",
            maxWeight: 99,
            color: "#dc3545"
        }
    },

    // Configuración de tipos de cangrejas
    crabTypes: {
        azul: {
            name: "Cangreja Azul",
            scientificName: "Callinectes sapidus",
            description: "Cangreja azul del Atlántico",
            averageWeight: 200,
            preferredTemp: 85,
            yieldRates: {
                special: 0.27,      // 27%
                superLump: 0.35,    // 35%
                jumbo: 0.18,        // 18%
                clawMeat: 0.07,     // 7%
                waste: 0.13         // 13% (restante)
            }
        },
        roja: {
            name: "Cangreja Roja",
            scientificName: "Callinectes danae",
            description: "Cangreja roja del Caribe",
            averageWeight: 180,
            preferredTemp: 82,
            yieldRates: {
                special: 0.34,      // 34%
                superLump: 0.19,    // 19%
                jumbo: 0.26,        // 26%
                clawMeat: 0.04,     // 4%
                waste: 0.17         // 17% (restante)
            }
        },
        verde: {
            name: "Cangreja Verde",
            scientificName: "Callinectes bocourti",
            description: "Cangreja verde del Pacífico",
            averageWeight: 160,
            preferredTemp: 80,
            yieldRates: {
                special: 0.20,      // 20%
                superLump: 0.40,    // 40%
                jumbo: 0.18,        // 18%
                clawMeat: 0.05,     // 5%
                waste: 0.17         // 17% (restante)
            }
        }
    },

    // Configuración de procesamiento
    processing: {
        cooking: {
            minTemp: 75,
            maxTemp: 95,
            defaultTemp: 85,
            minTime: 10,
            maxTime: 30,
            defaultTime: 15
        },
        cooling: {
            minTemp: 0,
            maxTemp: 10,
            defaultTemp: 4,
            minTime: 30,
            maxTime: 120
        },
        quality: {
            minMeatYield: 60,
            maxWastePercentage: 40,
            targetMeatYield: 75
        }
    },

    // Configuración de empaque
    packaging: {
        types: {
            caja: {
                name: "Caja",
                maxWeight: 25,
                description: "Caja de cartón corrugado"
            },
            bolsa: {
                name: "Bolsa",
                maxWeight: 10,
                description: "Bolsa plástica sellada"
            },
            contenedor: {
                name: "Contenedor",
                maxWeight: 1000,
                description: "Contenedor refrigerado"
            }
        }
    },

    // Configuración de transporte
    transport: {
        methods: {
            maritimo: {
                name: "Marítimo",
                duration: "7-14 días",
                cost: "Bajo",
                temperature: "Refrigerado"
            },
            aereo: {
                name: "Aéreo",
                duration: "1-3 días",
                cost: "Alto",
                temperature: "Refrigerado"
            },
            terrestre: {
                name: "Terrestre",
                duration: "2-5 días",
                cost: "Medio",
                temperature: "Refrigerado"
            }
        }
    },

    // Configuración de validaciones
    validations: {
        weight: {
            min: 50,
            max: 500,
            unit: "kg"
        },
        quantity: {
            min: 1,
            max: 10000,
            unit: "unidades"
        },
        temperature: {
            min: -10,
            max: 100,
            unit: "°C"
        },
        time: {
            min: 1,
            max: 480,
            unit: "minutos"
        }
    },

    // Configuración de reportes
    reports: {
        formats: ["json", "csv", "pdf"],
        defaultFormat: "json",
        autoBackup: true,
        backupInterval: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    },

    // Configuración de seguridad
    security: {
        sessionTimeout: 30 * 60 * 1000, // 30 minutos
        maxLoginAttempts: 3,
        passwordMinLength: 4,
        requireSpecialChars: false
    },

    // Configuración de interfaz
    ui: {
        theme: "default",
        language: "es",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm:ss",
        currency: "USD",
        decimalPlaces: 2
    },

    // Configuración de notificaciones
    notifications: {
        enabled: true,
        types: {
            success: {
                duration: 5000,
                position: "top-right"
            },
            warning: {
                duration: 7000,
                position: "top-right"
            },
            error: {
                duration: 10000,
                position: "top-right"
            },
            info: {
                duration: 5000,
                position: "top-right"
            }
        }
    },

    // Configuración de datos de ejemplo
    sampleData: {
        providers: [
            "Pesquera del Lago",
            "Mariscos Maracaibo",
            "Cangrejas del Sur",
            "Proveedor Norte",
            "Pesca Artesanal Zulia"
        ],
        destinations: [
            "Estados Unidos",
            "Canadá",
            "Europa",
            "Asia",
            "Mercado Local"
        ]
    }
};

// Funciones de utilidad para la configuración
const ConfigUtils = {
    // Obtener configuración de clasificación
    getClassificationConfig: (classification) => {
        return SYSTEM_CONFIG.classification[`class${classification}`];
    },

    // Obtener configuración de tipo de cangreja
    getCrabTypeConfig: (type) => {
        return SYSTEM_CONFIG.crabTypes[type];
    },

    // Validar peso según clasificación
    validateWeightForClassification: (weight, classification) => {
        const config = ConfigUtils.getClassificationConfig(classification);
        if (classification === 'A') {
            return weight >= config.minWeight;
        } else if (classification === 'B') {
            return weight >= config.minWeight && weight <= config.maxWeight;
        } else if (classification === 'C') {
            return weight <= config.maxWeight;
        }
        return false;
    },

    // Obtener temperatura recomendada para tipo de cangreja
    getRecommendedTemp: (crabType) => {
        const config = ConfigUtils.getCrabTypeConfig(crabType);
        return config ? config.preferredTemp : SYSTEM_CONFIG.processing.cooking.defaultTemp;
    },

    // Validar parámetros de procesamiento
    validateProcessingParams: (temp, time, meatYield, waste) => {
        const cooking = SYSTEM_CONFIG.processing.cooking;
        const quality = SYSTEM_CONFIG.processing.quality;
        
        const validations = {
            temp: temp >= cooking.minTemp && temp <= cooking.maxTemp,
            time: time >= cooking.minTime && time <= cooking.maxTime,
            meatYield: meatYield >= quality.minMeatYield,
            waste: (waste / (meatYield + waste)) * 100 <= quality.maxWastePercentage
        };
        
        return {
            isValid: Object.values(validations).every(v => v),
            validations
        };
    },

    // Generar ID único de contenedor
    generateContainerId: () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `CONT-${timestamp}-${random}`;
    },

    // Formatear fecha
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Formatear peso
    formatWeight: (weight) => {
        return `${weight.toFixed(SYSTEM_CONFIG.ui.decimalPlaces)} kg`;
    },

    // Obtener proveedores de ejemplo
    getSampleProviders: () => {
        return SYSTEM_CONFIG.sampleData.providers;
    },

    // Obtener destinos de ejemplo
    getSampleDestinations: () => {
        return SYSTEM_CONFIG.sampleData.destinations;
    },

    // Calcular rendimiento de carne basado en peso y estado
    calculateMeatYield: (crabType, weight, status) => {
        const config = ConfigUtils.getCrabTypeConfig(crabType);
        if (!config) return null;

        // Factor de ajuste basado en estado (vivo vs muerto)
        let statusMultiplier = 1.0;
        if (status === 'viva') {
            statusMultiplier = 0.95; // Cangrejos vivos generan menos desechos
        } else if (status === 'muerta') {
            statusMultiplier = 1.15; // Cangrejos muertos generan más desechos
        }

        const yieldRates = config.yieldRates;
        const adjustedWeight = weight * statusMultiplier;

        return {
            special: (adjustedWeight * yieldRates.special).toFixed(2),
            superLump: (adjustedWeight * yieldRates.superLump).toFixed(2),
            jumbo: (adjustedWeight * yieldRates.jumbo).toFixed(2),
            clawMeat: (adjustedWeight * yieldRates.clawMeat).toFixed(2),
            waste: (adjustedWeight * yieldRates.waste).toFixed(2),
            totalMeat: (adjustedWeight * (1 - yieldRates.waste)).toFixed(2),
            totalWeight: adjustedWeight.toFixed(2),
            efficiency: ((1 - yieldRates.waste) * 100).toFixed(1) + '%'
        };
    },

    // Obtener estadísticas de rendimiento por tipo
    getYieldStatistics: (crabType) => {
        const config = ConfigUtils.getCrabTypeConfig(crabType);
        if (!config) return null;

        return {
            type: crabType,
            name: config.name,
            averageWeight: config.averageWeight,
            yieldRates: config.yieldRates,
            efficiency: ((1 - config.yieldRates.waste) * 100).toFixed(1) + '%'
        };
    },

    // Calcular rendimiento estimado para diferentes pesos
    getEstimatedYield: (crabType, weight) => {
        const config = ConfigUtils.getCrabTypeConfig(crabType);
        if (!config) return null;

        const yieldRates = config.yieldRates;
        
        return {
            weight: weight,
            special: (weight * yieldRates.special).toFixed(2),
            superLump: (weight * yieldRates.superLump).toFixed(2),
            jumbo: (weight * yieldRates.jumbo).toFixed(2),
            clawMeat: (weight * yieldRates.clawMeat).toFixed(2),
            waste: (weight * yieldRates.waste).toFixed(2),
            totalMeat: (weight * (1 - yieldRates.waste)).toFixed(2)
        };
    },

    // Clasificar automáticamente basado en el rendimiento de materia prima comestible
    autoClassifyByYield: (crabType, weight, status) => {
        const yield = ConfigUtils.calculateMeatYield(crabType, weight, status);
        if (!yield) return null;

        const totalWeight = parseFloat(yield.totalWeight);
        const totalMeat = parseFloat(yield.totalMeat);
        const ediblePercentage = (totalMeat / totalWeight) * 100;

        let classification = '';
        let classificationReason = '';

        if (ediblePercentage > 50) {
            classification = 'A';
            classificationReason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Excelente rendimiento)`;
        } else if (ediblePercentage >= 40 && ediblePercentage <= 50) {
            classification = 'B';
            classificationReason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Rendimiento aceptable)`;
        } else {
            classification = 'C';
            classificationReason = `Materia prima comestible: ${ediblePercentage.toFixed(1)}% (Rendimiento bajo)`;
        }

        return {
            classification: classification,
            reason: classificationReason,
            ediblePercentage: ediblePercentage.toFixed(1),
            totalMeat: yield.totalMeat,
            totalWeight: yield.totalWeight,
            yield: yield
        };
    },

    // Obtener información de clasificación
    getClassificationInfo: (classification) => {
        const config = ConfigUtils.getClassificationConfig(classification);
        if (!config) return null;

        return {
            class: classification,
            name: config.name,
            description: config.description,
            color: config.color,
            minEdiblePercentage: classification === 'A' ? 50 : classification === 'B' ? 40 : 0,
            maxEdiblePercentage: classification === 'A' ? 100 : classification === 'B' ? 50 : 40
        };
    }
};

// Exportar configuración para uso global
window.SYSTEM_CONFIG = SYSTEM_CONFIG;
window.ConfigUtils = ConfigUtils; 