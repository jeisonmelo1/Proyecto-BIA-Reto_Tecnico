# 05 · Registro de defectos

## Índice

| ID | Título | Severidad | Prioridad | Estado |
|---|---|---|---|---|
| DEF-01 | `getAll` devuelve 500 con `page` negativo o desbordado | Alta | Alta | Abierto |
| DEF-02 | Filtro `meter_id` distingue mayúsculas pese a lo documentado | Media | Media | Abierto |
| DEF-03 | Paginación acepta `size=0`/`page=0` y los reemplaza en silencio | Baja | Baja | Abierto |
| DEF-04 | Login: email sin formato devuelve 401 y no se valida en UI | Baja | Baja | Abierto |
| DEF-05 | Libro de medidores: «Siguiente» siempre deshabilitado (no se puede pasar a la página 2) | Media | Media | Abierto |
| OBS-01 | «3 órdenes abiertas» frente a 4 anomalías listadas | Informativa | Baja | Explicada |

---

## DEF-01 · `POST /meter/getAll` devuelve 500 con `page` negativo o desbordado

- **Severidad:** Alta · **Prioridad:** Alta. Un error 500 por entrada de cliente es una falla de validación, filtra un fallo interno y puede indicar una excepción no controlada que cualquier cliente autenticado dispara. Impacta la paginación, riesgo P2 del plan.
- **Pasos:**
  1. Obtener `$TOKEN` con `POST /auth/login`.
  2. Enviar `POST $API/meter/getAll` con `{"pagination":{"page":-1,"size":10}}`.
  3. Repetir con `page` = -5, `page` = -1 con `size` 1 y `page` = 9223372036854775807.
- **Datos:** 12 medidores en el dataset; `size` válido (10 o 1).
- **Esperado:** 400 con `APIError` y detalle del campo, como ocurre con `size=-1` o `size=101` (fuente: OpenAPI, `pagination.page` mínimo 1; convención de error del propio servicio).
- **Obtenido:** 500 `{"status_code":500,"message":"Error interno del servidor",...}` en los cuatro casos. `page=0` devuelve 200 (ver DEF-03).
- **Evidencia (request/response):**
  ```
  curl -i -X POST "$API/meter/getAll" -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" --data-binary '{"pagination":{"page":-1,"size":10}}'
  HTTP/1.1 500 Internal Server Error
  {"status_code":500,"message":"Error interno del servidor","timestamp":"2026-10-22T20:38:49Z","path":"/api/v1/meter/getAll"}
  ```
- **Causa raíz probable:** no identificada (caja negra). Hipótesis: el cálculo de `offset = (page-1) * size` produce un índice negativo o desbordado y el segmento resultante provoca un pánico/excepción; la validación solo cubre `size`. Archivo y línea: pendiente de acceso al código del backend.
- **Detección automática:** prueba de contrato/propiedades sobre `getAll` (p. ej. Schemathesis o Dredd contra el OpenAPI) que verifique que ninguna entrada devuelve 5xx; más una tabla de pruebas de límites de `page` y `size` en la suite de API. Alerta en monitorización por tasa de 5xx.

## DEF-02 · El filtro `meter_id` distingue mayúsculas pese a lo documentado

- **Severidad:** Media · **Prioridad:** Media. El operador que escribe en minúsculas no encuentra medidores existentes y puede concluir que no existen; hay una solución sencilla y no hay pérdida de datos.
- **Pasos (API):** `POST $API/meter/getAll` con `{"filter":{"meter_id":"m-109"}}`; repetir con `m-1`, `m`, `m109`, y de contraste `M-109` y `109`.
- **Pasos (UI):** abrir `/medidores?medidor=m-109` o escribir `m-109` en «Medidor» y pulsar buscar.
- **Datos:** M-101…M-112.
- **Esperado:** coincidencia parcial e insensible a mayúsculas, p. ej. `m-109` → M-109 y `m-1` → 12 medidores (fuente: OpenAPI, descripción de `meter_id`: «parcial, insensible a mayúsculas»). Además `GET /meter/getById/m-109` ya funciona en minúsculas, lo que hace el comportamiento inconsistente.
- **Obtenido:** `m-109`, `m-1`, `m` y `m109` → 200 con `count=0`; `M-109` y `109` → `count=1`. La UI muestra «Ningún medidor coincide con los filtros / No hay medidores que contengan "m-109"».
- **Evidencia:**
  ```
  curl -s -X POST "$API/meter/getAll" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       --data-binary '{"filter":{"meter_id":"m-109"}}'
  -> {"count":0,"page":1,"size":10,"rows":[]}
  ```
  Captura de la UI: no guardada (se registró el texto del estado vacío).
- **Causa raíz probable:** no identificada. Hipótesis: comparación con `contains` sensible a mayúsculas, con las minúsculas solo normalizadas en `getById`.
- **Detección automática:** prueba parametrizada de API con el mismo término en mayúsculas, minúsculas y mixto que exija el mismo conjunto de resultados; el mismo caso en un escenario E2E de la UI.

## DEF-03 · La paginación acepta `size=0` y `page=0` y los reemplaza en silencio

- **Severidad:** Baja · **Prioridad:** Baja. Contrato ambiguo e inconsistente, sin pérdida de datos; el cliente puede enmascarar errores propios.
- **Pasos:** `POST $API/meter/getAll` con `{"pagination":{"page":1,"size":0}}`, luego `{"page":0,"size":10}` y `{"page":0,"size":0}`; contraste con `size=-1` y `size=101`.
- **Datos:** dataset de 12 medidores.
- **Esperado:** 400 en todos los valores fuera de rango (fuente: OpenAPI, `page` mínimo 1 y `size` entre 1 y 100).
- **Obtenido:** `size=0` → 200 con `size:10`; `page=0` → 200 con `page:1`; `size=-1` y `size=101` → 400. La respuesta no avisa de que se cambió el valor.
- **Evidencia:**
  ```
  --data-binary '{"pagination":{"page":0,"size":0}}'
  -> 200 {"page":1,"size":10,"count":12,"rows":[...10 filas...]}
  ```
- **Causa raíz probable:** no identificada. Hipótesis: el valor cero se trata como «no informado» (valor por defecto de Go/JSON) y la validación solo rechaza negativos o > 100.
- **Detección automática:** pruebas de límites (BVA) en la suite de API para `page` y `size` en cada valor límite, que esperen 400 fuera de rango; falla si aparece 200.

## DEF-04 · Login con email sin formato devuelve 401 y la UI no valida el formato

- **Severidad:** Baja · **Prioridad:** Baja. Solo afecta la experiencia: el mensaje de credenciales incorrectas no orienta al usuario. No hay riesgo de seguridad (el mensaje genérico es deseable).
- **Pasos (API):** `POST $API/auth/login` con `{"email":"correo-sin-formato","password":"<válida>"}`.
- **Pasos (UI):** en `/login` escribir `correo-sin-formato` y una contraseña, pulsar «Entrar».
- **Datos:** email sin `@`/dominio; contraseña de la cuenta de pruebas (ver gestor de secretos).
- **Esperado:** validación de formato: 400 con `errors[]` en la API y aviso en el campo en la UI (sentido común; el servicio ya devuelve 400 con `errors[]` para campos vacíos y tipos erróneos). La especificación no lo exige de forma explícita, por eso la severidad es baja.
- **Obtenido:** API 401 «Email o contraseña incorrectos»; UI muestra «Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.» tras la petición.
- **Evidencia:**
  ```
  HTTP/1.1 401 Unauthorized
  {"status_code":401,"message":"Email o contraseña incorrectos","timestamp":"...","path":"/api/v1/auth/login"}
  ```
  Consola del navegador: `Failed to load resource: 401 (Unauthorized)`.
- **Causa raíz probable:** no identificada; la validación del DTO solo comprueba presencia, no formato.
- **Detección automática:** caso de API con emails inválidos (sin `@`, sin dominio) que espere 400; caso E2E de UI que verifique el aviso antes de enviar.

## DEF-05 · Libro de medidores: «Siguiente» siempre deshabilitado

- **Severidad:** Media · **Prioridad:** Media. Con 12 medidores y 10 por página, los 2 últimos solo se alcanzan editando la URL (`?pagina=2`); un usuario normal nunca los ve. Impacta el riesgo P3 (paginación) del plan.
- **Entorno:** Chromium 1.59 (Playwright), Windows, UI `http://localhost:5173`.
- **Pasos:** iniciar sesión, abrir `/medidores` (texto «1–10 de 12 medidores») e intentar pulsar «Siguiente».
- **Datos:** dataset por defecto (12 medidores), tamaño de página 10.
- **Esperado:** «Siguiente» habilitado mientras haya más resultados (sentido común; el contador indica 12 en total).
- **Obtenido:** «Anterior» y «Siguiente» deshabilitados en la página 1. Con `/medidores?pagina=2` se muestra «11–12 de 12» con «Anterior» habilitado y «Siguiente» deshabilitado (correcto en la última página).
- **Evidencia:** `getByRole('button',{name:'Siguiente'}).isDisabled()` → `true` en la página 1; prueba `CB-12 … (DEF-05)` en `e2e/tests/ui/meters.spec.ts`.
- **Causa raíz probable:** no identificada (caja negra). Hipótesis: la condición de habilitado usa el número de la página actual frente a un total mal calculado.
- **Detección automática:** E2E que comprueba «Siguiente» habilitado con más de una página (ya incluido, marcado `test.fail`).

---

## OBS-01 · «3 órdenes abiertas» frente a 4 anomalías listadas

- **Severidad:** Informativa · **Prioridad:** Baja.
- **Entorno:** el común, UI Despacho y `GET /dashboard/getSummary`.
- **Pasos:** abrir el Despacho y comparar el texto con las filas; consultar `getSummary`.
- **Esperado:** cifras coherentes o textos que expliquen la diferencia.
- **Obtenido:** la API indica 4 anomalías detectadas (la doc dice que incluye falsos positivos), 2 con severidad HIGH y 3 con `anomaly=true`; el falso positivo M-106 no es una orden. La UI muestra 4 filas junto al texto «3 órdenes abiertas».
- **Conclusión:** no es un defecto de datos; se recomienda aclarar el texto de la UI.

---