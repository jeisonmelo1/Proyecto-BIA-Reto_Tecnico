# Estrategia de pruebas — EnergIA

**Objetivo:** validar que EnergIA detecta, clasifica y presenta correctamente las anomalías de consumo para que el usuario sepa qué medidor revisar primero y qué hacer.

**Producto y entorno:** aplicación web con login y cuatro vistas protegidas: Despacho (`/`), Medidores (`/medidores`, `/medidores/:id`), Anomalías IA (`/anomalias`, `/anomalias/:id`) y la acción *Run AI Analysis*. Dataset observado: 12 medidores, 14 días, 4.032 lecturas horarias y 4 anomalías (real, calidad de datos, explicable y falso positivo). La estrategia parte de la interfaz; API y reglas de negocio se confirmarán con el equipo de producto.

## Alcance

**Incluido**
- **Acceso:** login válido/ inválido/ vacío, rutas protegidas sin sesión y cierre de sesión.
- **Despacho:** indicadores de planta, órdenes ordenadas por prioridad y enlaces a medidor e investigación.
- **Medidores:** filtro por estado, búsqueda, ordenamiento, paginación y detalle (consumo 24 h, baseline, variación, variables eléctricas, histórico por hora, consumo diario, eventos).
- **Anomalías:** tipo, severidad, explicación, acción, evidencia ponderada, confianza (0,5–0,95) y eventos relacionados.
- **Run AI Analysis:** estados de ejecución, resultado actualizado y manejo de errores.
- **Transversal:** consistencia de cifras entre vistas, formatos localizados (fechas, `kWh`, `%`, decimales con coma) y accesibilidad básica (teclado, foco, etiquetas).

**Fuera de alcance inicial (y por qué)**
- **Precisión científica del modelo y validez operativa de las recomendaciones:** requiere datos etiquetados y criterio de dominio; solo se verifica coherencia con las reglas documentadas.
- **Carga, penetración e infraestructura:** no hay objetivos de rendimiento ni autorización de seguridad ofensiva definidos.
- **Integraciones con medidores físicos o terceros:** no se exponen en la interfaz.
- **Compatibilidad exhaustiva:** se cubre Chrome/Chromium de escritorio; otros navegadores y móviles se añaden cuando producto los priorice.

## Análisis de riesgos priorizado

Prioridad = impacto × probabilidad. El impacto máximo es no atender a tiempo una anomalía real o exponer datos.

| Prioridad | Riesgo si falla | Enfoque de validación |
|---|---|---|
| **P1 — Crítica** | Una anomalía real (p. ej. +110 % sobre baseline) no se detecta, se clasifica como explicable/falso positivo o recibe una acción inadecuada. | Unitarias de reglas y confianza con casos límite; API e E2E con dataset conocido (un caso por tipo de anomalía). |
| **P1 — Crítica** | Acceso a vistas o datos sin sesión válida, o usuario legítimo bloqueado. | Autenticación/autorización en API (si existe) y E2E de login, ruta protegida y logout. |
| **P2 — Alta** | Consumo, baseline, variación, estado o severidad incorrectos o inconsistentes entre Despacho, listado y detalle (p. ej. “3 órdenes abiertas” vs. 4 anomalías, por aclarar). | Unitarias de cálculo y formato; contratos de API; comparación cruzada de cifras en UI. |
| **P2 — Alta** | *Run AI Analysis* falla, duplica resultados o deja la pantalla en estado incoherente. | Estados y errores en API/integración; E2E con éxito y fallo simulado. |
| **P3 — Moderada** | Filtros, búsqueda, orden, paginación, gráficos o accesibilidad fallan y entorpecen el trabajo diario. | Pruebas de componentes y E2E representativos, incluido teclado. |

## Tipos de prueba y capas

Se sigue una pirámide: muchas pruebas rápidas abajo y pocos E2E críticos arriba.

| Capa | Tipo | Qué valida | Herramienta / estado |
|---|---|---|---|
| **Unitaria** | Caja blanca | Baseline (mediana de 7 días), variación, severidad, clasificación, confianza, fechas y formato; ramas y límites (cero, valores ausentes, empates). | Runner del proyecto de la aplicación; requiere acceso al código. |
| **API** | Contrato y funcional | Autenticación y permisos, esquemas, filtros/orden/paginación, ejecución del análisis y errores. | Cuando existan endpoints documentados; hoy por confirmar. |
| **Integración** | Datos | Coherencia entre lecturas, eventos, medidores y anomalías; estado persistido tras el análisis. | Dataset semilla controlado. |
| **UI / E2E** | Caja negra | Recorrido login → Despacho → medidor → investigación; filtros, búsqueda y *Run AI Analysis*. | Playwright Test + Page Object Model (`e2e/`); hoy cubre un conjunto semilla de 26 pruebas de login, medidores (UI) y auth/paginación/filtros (API). |
| **UI** | Accesibilidad y compatibilidad | Etiquetas, foco, teclado y Chrome/Chromium. | Revisión manual y comprobaciones automáticas. |
| **UI** | Smoke | Checklist rápido tras cada despliegue (`02-smoke.md`). | Manual, luego automatizable. |

Los casos detallados están en `03-casos-caja-negra.md`, `04-caja-blanca.md` y `05-defectos.md`.

## Criterios de entrada y salida

**Entrada** (para iniciar cada ciclo)
- Entorno desplegado, accesible y con versión identificada.
- Dataset semilla controlado y fijo, con un caso por tipo (normal, alerta, real, calidad de datos, explicable, falso positivo) y resultados esperados acordados.
- Reglas de negocio y, para pruebas de API, contratos disponibles.
- Credenciales de prueba entregadas por un canal seguro y nunca registradas en la documentación.
- Criterios de aceptación revisados y defectos bloqueantes conocidos documentados.
- El smoke test pasa; si SM-01, SM-02, SM-04, SM-05 o SM-07 fallan, no se continúa.

**Salida** (para considerar la versión lista)
- 100 % de los casos P1 ejecutados y aprobados; sin defectos P1 ni de severidad alta abiertos.
- Al menos 90 % de los casos P2 aprobados; los fallos restantes, resueltos o aceptados por escrito por el responsable de producto.
- Todos los criterios de aceptación de los flujos incluidos trazados a al menos un caso ejecutado.
- Cobertura de ramas de las reglas críticas acordada con el equipo (referencia inicial: ≥ 80 %), medida en la capa unitaria y no con E2E.
- Resultados reproducibles e informados por capa; fallos intermitentes investigados.
- Informe final con riesgos residuales, limitaciones y defectos conocidos.

Si no se cumple un criterio, la versión no se libera hasta corregirlo o aprobar formalmente la excepción.
