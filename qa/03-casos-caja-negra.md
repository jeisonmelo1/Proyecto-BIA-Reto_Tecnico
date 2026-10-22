# 03 · Casos de prueba de caja negra (UI + API)

## Técnicas aplicadas

| Sigla | Técnica | Casos |
|---|---|---|
| EP | Partición de equivalencia | 01, 02, 04, 05, 13, 14, 16, 18 |
| BVA | Análisis de valores límite | 09, 10, 11, 12 |
| TD | Tabla de decisión | 19, 20, 21 |
| NEG | Negativas / validación de entradas | 03, 06, 07, 08, 10, 11, 15, 24 |
| CAP | Consistencia entre capas (API ↔ UI ↔ doc) | 15, 17, 22, 23, 24 |

## A. Login (`POST /auth/login` y pantalla `/login`)

**CB-01 · Login válido** · EP (válida) · P1
- Precondición: sin sesión. Pasos: enviar credenciales válidas por API y por UI. Datos: cuenta admin del entorno.
- Esperado: API 200 con `access_token`, `token_type=Bearer`, `expires_in=28800`, `user`; UI entra al Despacho.
- Obtenido: API 200 con los campos esperados (`expires_in` 28800); UI entra al Despacho (y vuelve a la ruta pedida si venía de una protegida). · **Pasa**

**CB-02 · Credenciales inválidas** · EP (inválidas) · P1
- Datos: contraseña incorrecta; email inexistente.
- Esperado: 401 con `APIError` y mensaje genérico; UI muestra error sin revelar qué campo falló.
- Obtenido: 401 `"Email o contraseña incorrectos"` en ambos casos; UI: alerta "Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo." · **Pasa**

**CB-03 · Campos obligatorios vacíos** · NEG
- Datos: email vacío; password vacío; ambos; `{}`; campos `null`; cuerpo vacío.
- Esperado: 400 con detalle en `errors[]`; UI no envía la petición y avisa.
- Obtenido: 400 en los 6 casos (`"Datos inválidos"`, `errors:["email es obligatorio","password es obligatorio"]`); UI: "Escribe tu email y tu contraseña." · **Pasa**

**CB-04 · Normalización del email** · EP
- Datos: `ADMIN@ENERGIA.LOCAL`; ` admin@energia.local ` (espacios).
- Esperado: el email es insensible a mayúsculas y se recorta (comportamiento habitual; no contradice la doc).
- Obtenido: 200 en ambos. · **Pasa**

**CB-05 · Contraseña sensible a mayúsculas** · EP
- Datos: contraseña correcta en MAYÚSCULAS. Esperado: 401. Obtenido: 401. · **Pasa**

**CB-06 · Email sin formato** · NEG
- Datos: `admin` / `correo-sin-formato` con contraseña correcta.
- Esperado: validación de formato (400 en API; aviso en UI) o, como mínimo, mensaje consistente.
- Obtenido: API 401 (no 400); UI muestra el mismo error de credenciales. No hay validación de formato en ninguna capa. · **Observación** (DEF-04)

**CB-07 · Cargas hostiles y tipos erróneos** · NEG · P1
- Datos: `' OR 1=1--` en email; email/password numéricos; JSON malformado.
- Esperado: nunca 200 ni 500; errores controlados.
- Obtenido: 401 para la cadena SQL; 400 para tipos numéricos y JSON malformado (`"body inválido: …"`). · **Pasa**

## B. Autorización

**CB-08 · Endpoints protegidos sin token válido** · NEG · P1
- Datos: sin cabecera `Authorization`; `Bearer x.y.z`. Endpoints: `auth/me`, `meter/getAll`, `meter/getParams`, `anomaly/getAll`, `dashboard/getSummary`, `ai/analyze`, `ai/analysis/latest`.
- Esperado: 401 con `APIError`. En UI, ruta protegida sin sesión redirige a `/login`.
- Obtenido: 401 en los 7 endpoints en ambos casos (`"Falta el token de autenticación"` / `"Token inválido o expirado"`); `/anomalias` sin sesión redirige a `/login`. · **Pasa**

## C. Paginación (`POST /meter/getAll`, `pagination`: page ≥ 1, size 1–100, por defecto 1/10) · 12 medidores

**CB-09 · Tamaño de página válido en los límites** · BVA · P2
- Datos: size = 1, 11, 12 (=total), 13, 100 (máx.).
- Esperado: filas = min(size, 12); `count`=12.
- Obtenido: 1, 11, 12, 12, 12 filas; `count`=12 siempre. · **Pasa**

**CB-10 · Tamaño de página fuera de rango** · BVA + NEG · P2
- Datos: size = 101, -1, 0.
- Esperado: 400 en los tres (mínimo documentado = 1, máximo = 100).
- Obtenido: 101 → 400; -1 → 400; **0 → 200 y se sustituye silenciosamente por 10**. Comportamiento inconsistente entre -1 y 0. · **Falla** (DEF-03)

**CB-11 · Número de página en los límites** · BVA + NEG · P2
- Datos: page = 1, 2 (parcial, size 10), 6 (última con size 2), 7 (fuera), 0, -1, -5, 9223372036854775807.
- Esperado: 1/2/6 con filas; 7 vacía con `count`=12; valores < 1 → 400.
- Obtenido: 1 → 10 filas; 2 → 2 filas (M-111, M-112); 6 → 2 filas; 7 → 0 filas; 0 → 200 tratado como 1; **-1, -5 y 9223372036854775807 → 500 "Error interno del servidor"**. · **Falla** (DEF-01)

**CB-12 · `count` estable y valores por defecto** · BVA · P2
- Datos: sin cuerpo; solo `page`; solo `size`; size texto/decimal.
- Esperado: defaults 1/10; `count` sin paginar; tipos erróneos → 400.
- Obtenido: sin cuerpo → page 1, size 10, `count`=12; solo `page=2` → 2 filas; solo `size=5` → 5 filas; `"diez"` y `2.5` → 400. UI: "1–2 de 2 medidores" con botones Anterior/Siguiente deshabilitados. · **Pasa**

## D. Filtros y orden

**CB-13 · Filtro de estado (partición NORMAL/ALERT/CRITICAL/inválido/vacío)** · EP · P2
- Datos: `NORMAL`, `ALERT`, `CRITICAL`, `FOO`, `""`.
- Esperado: 8 / 2 / 2 filas (suman 12); `FOO` → 400; vacío = sin filtro.
- Obtenido: 8 / 2 (M-104, M-106) / 2 (M-109, M-112); `FOO` → 400; vacío → 12. (`critical` en minúscula también se acepta; no es un defecto.) · **Pasa**

**CB-14 · Filtro `meter_id` (parcial)** · EP · P2
- Datos: `109`, ` 109 `, `ZZZ`, `""`, `%`, `' OR 1=1--`.
- Esperado: coincidencia parcial; sin coincidencias → vacío; vacío = todos; caracteres especiales tratados como texto.
- Obtenido: `109` → 1 (M-109); espacios recortados → 1; `ZZZ`, `%` y SQL → 0 filas con 200; vacío → 12. UI: estado vacío "Ningún medidor coincide con los filtros". · **Pasa**

**CB-15 · Filtro `meter_id` insensible a mayúsculas** · CAP (doc ↔ API ↔ UI) + NEG
- Datos: `m-109`, `m-1`, `m`, `m109`; en UI `/medidores?medidor=m-109`.
- Esperado (OpenAPI: «parcial, insensible a mayúsculas»): `m-109` → M-109; `m-1` → 12 medidores.
- Obtenido: API `m-109` → 0, `m-1` → 0, `m` → 0 (con `M-109` y `109` sí funciona). UI muestra "No hay medidores que contengan "m-109"". Contradice la documentación. Nota: `getById/m-109` sí funciona en minúsculas. · **Falla** (DEF-02)

**CB-16 · Combinación estado + id** · EP
- Datos: `CRITICAL`+`112`; `CRITICAL`+`101`.
- Esperado: intersección (AND). Obtenido: 1 fila (M-112); 0 filas. UI (`?estado=CRITICAL&medidor=109`): 1 fila M-109, "1–1 de 1 medidores". · **Pasa**

**CB-17 · Orden por campo y dirección** · EP + CAP
- Datos: `sort_by` ∈ {meter_id, consumption, variation, severity} × {ASC, DESC}; `sort_by=foo`; `sort_order=UP`.
- Esperado: orden correcto en 8 combinaciones; inválidos → 400.
- Obtenido: `consumption DESC` empieza en M-109 (2.207,6) y termina en M-107; `variation DESC` empieza en M-109 (+109,8 %); `severity DESC` → M-109, M-112, M-104, M-106 y luego los normales (sin severidad al final); `meter_id` ASC/DESC invertidos; inválidos → 400. · **Pasa**

## E. Detalle y reglas de negocio

**CB-18 · Detalle de medidor** · EP · `GET /meter/getById/{id}`
- Datos: `M-109`, `m-109`, `M-999`, `109`.
- Esperado: válido 200; inexistente 404.
- Obtenido: 200, 200, 404, 404. · **Pasa**

**CB-19 · Tabla de decisión: tipo de anomalía → estado / severidad / prioridad / acción** · TD · P1
Se derivó de la UI (Anomalías IA) y se verificó contra `meter/getById` y `anomaly/getAll`.

| Regla | Tipo | Estado medidor | Severidad | Prioridad | Acción | `anomaly` | Confianza | Medidor |
|---|---|---|---|---|---|---|---|---|
| R1 | REAL_ANOMALY | CRITICAL | HIGH | 1 | Investigar en sitio | true | 0,95 | M-109 |
| R2 | DATA_QUALITY | CRITICAL | HIGH | 2 | Validar medidor | true | 0,95 | M-112 |
| R3 | EXPLAINABLE_ANOMALY | ALERT | MEDIUM | 3 | Validar con operación | true | 0,86 | M-104 |
| R4 | FALSE_POSITIVE | ALERT | LOW | 4 | No escalar | **false** | 0,86 | M-106 |

- Esperado: cada regla se cumple en API y UI; prioridad creciente por impacto; el falso positivo no cuenta como anomalía real.
- Obtenido: las 4 reglas coinciden en API y UI. Observación: R4 deja el medidor en estado «Alerta» aunque la anomalía es un falso positivo y su variación de 24 h es +1,0 % (la caída de −79,8 % ocurrió en una ventana de 12 h y ya se normalizó); es coherente con la doc, pero conviene confirmarlo con producto. En UI R4 muestra «Ver detalle» en vez de un botón de acción. · **Pasa**

**CB-20 · Regla sin anomalía** · TD
- Datos: medidor NORMAL (M-101). Esperado: `severity`, `priority`, `anomaly_type` = `null`; no aparece en Anomalías IA. Obtenido: los tres `null`; variación −0,11 %. · **Pasa**

**CB-21 · Re-ejecutar el análisis no altera las reglas** · TD (estabilidad) · P1
- Datos: dos `POST /ai/analyze` consecutivos (AN-0004, AN-0005).
- Esperado: mismos 4 resultados, misma prioridad y mismos valores.
- Obtenido: ambos 202 y terminan en milisegundos (COMPLETED); el dashboard sigue con 4 anomalías y 2 que requieren atención; M-109/M-112/M-104/M-106 sin cambios. Efecto lateral: se crearon AN-0004 y AN-0005. No se pudo probar el caso «ya en ejecución» (200) porque el análisis termina demasiado rápido. · **Pasa**

## F. Consistencia entre capas

**CB-22 · Resumen del Despacho: API ↔ UI ↔ documentación** · CAP · P1
- Datos: `GET /dashboard/getSummary` frente al Despacho.
- Esperado: mismas cifras.
- Obtenido: 12 medidores; 8/2/2; 4 anomalías detectadas (la doc dice que incluye falsos positivos) y 2 con severidad HIGH; confianza media 0,90; consumo 155.250,85 kWh (UI 155,3 MWh) y +16,01 % (UI +16,0 %). El texto «3 órdenes abiertas» coincide con las 3 anomalías con `anomaly=true` (el falso positivo no es orden); **OBS-01 queda explicada, aunque el texto de la UI es ambiguo frente a las 4 filas**. · **Pasa**

**CB-23 · Fila de medidor: API ↔ UI** · CAP
- Datos: M-109, M-112, M-104, M-106 en `/medidores` frente a `meter/getById`.
- Esperado: mismos consumo, baseline, variación y severidad, con el redondeo/formato es-CO.
- Obtenido: M-109 → 2.207,6 / 1.052,2 kWh / +109,8 % / Alta (API 2207.6 / 1052.15 / 109.82); M-112 → 0,0 % (API −0.03); M-104 +47,3 %; M-106 +1,0 %. Nota documental: el texto de la anomalía dice +110,5 % (M-109) y +46,5 % (M-104) porque mide la ventana del cambio, no las últimas 24 h; está documentado en `evidence`, pero la UI muestra ambas cifras sin aclararlo. · **Pasa**

**CB-24 · Consulta de análisis por ID** · NEG + CAP
- Datos: `GET /ai/analysis/latest`; `/ai/analysis/AN-0005`; `AN-9999`; `xx`.
- Esperado: existente 200 con `steps`; inexistente 404.
- Obtenido: 200 (`latest` = AN-0005, COMPLETED, 7 ms, pasos DONE: «4.032 lecturas · 12 medidores»); `AN-9999` y `xx` → 404. El dashboard (`last_analysis`) y la UI muestran el mismo último análisis. · **Pasa**
