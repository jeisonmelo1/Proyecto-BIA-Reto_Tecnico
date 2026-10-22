# Pruebas de caja blanca

## Estado actual

La automatización bajo `../e2e/tests/` usa Playwright Test con Page Object Model (sin Cucumber) y cubre un conjunto semilla de login, medidores y API (ver `../e2e/README.md`). Son pruebas de caja negra sobre UI y API; no contiene pruebas unitarias ni lógica de negocio propia de EnergIA. Por tanto, no demuestra cobertura de los cálculos o reglas de anomalías del producto.

## Cobertura a desarrollar

Cuando la lógica y sus interfaces estén disponibles, añadir pruebas unitarias deterministas para:

- Cálculo de baseline, variación y redondeo, incluidos cero, valores ausentes, límites y unidades.
- Clasificación de anomalías, severidad y prioridad; correlación con eventos y ventanas horarias.
- Cálculo de confianza, límites del puntaje y casos con señales parciales o contradictorias.
- Conversión de fechas y zonas horarias al presentar lecturas horarias.
- Filtros, ordenamientos y paginación, incluidos empates, listas vacías y combinaciones de filtros.
- Manejo de errores, reintentos y estados de ejecución del análisis.

## Criterios de caja blanca

- Cubrir ramas positivas, negativas y límites en reglas críticas; usar casos parametrizados y datos pequeños controlados.
- Evitar depender de red, reloj real, aleatoriedad o servicios externos en pruebas unitarias.
- Medir cobertura de ramas/líneas de la lógica de negocio, no usar la cobertura E2E como sustituto.
- Revisar cambios para detectar rutas sin validar y mantener pruebas de regresión asociadas a cada defecto corregido.
- Ejecutar verificación de tipos junto con las pruebas; registrar como bloqueo la configuración de compilación incompatible hasta corregirla.

## Aplicación al código actual

La suite existente verifica flujos de UI y API de EnergIA por caja negra; no es caja blanca del dominio. Las observaciones de implementación y los puntos pendientes se registran en `05-defectos.md`; no se atribuye cobertura que no haya sido medida.
