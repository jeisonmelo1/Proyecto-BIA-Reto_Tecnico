# Smoke test — EnergIA

**Tipo:** checklist manual de verificación rápida.    
**Objetivo:** responder una sola pregunta: *¿este build se puede probar?* Si alguno de estos casos falla, no tiene sentido invertir tiempo en pruebas funcionales más profundas.

## Criterio de selección

Se incluye solo lo que, si falla, **bloquea a cualquier otro tester**: entrar, ver el dato principal, navegar la cadena Despacho → medidor → investigación, ejecutar la acción central y salir. Se deja fuera lo que no bloquea el resto de pruebas (credenciales inválidas, ordenamiento, paginación, gráficos de detalle, accesibilidad, formatos), que está en `03-casos-caja-negra.md`.

## Precondiciones

- Aplicación desplegada y accesible; usar la URL del entorno objetivo.
- Cuenta de prueba habilitada. Obtener credenciales del gestor seguro del equipo; no registrar contraseñas en este documento ni en evidencias.
- Datos de prueba con medidores y al menos una anomalía disponible.

## Checklist, justificación y resultado

| ID | Verificación | Resultado esperado | Por qué está en el smoke | Resultado |
|---|---|---|---|---|
| SM-01 | Abrir la aplicación e iniciar sesión con una cuenta válida. | Se autentica y muestra el despacho sin errores. | Sin acceso no se puede probar nada más; cubre además el riesgo P1 de usuario legítimo bloqueado. | ✅ Aprobado. Tras un login limpio la app volvió a la ruta solicitada (`/medidores/M-109`). |
| SM-02 | Revisar los indicadores de planta y las órdenes de trabajo. | Se muestran valores y órdenes; cada orden indica medidor, categoría, prioridad y acción. | Es la pantalla principal y la salida más importante del producto: la lista priorizada de qué atender. | ✅ Aprobado. 4 órdenes (M-109, M-112, M-104, M-106) con categoría, severidad, confianza y acción; indicadores de planta: 12 medidores (8 normales · 2 alerta · 2 críticas). |
| SM-03 | Abrir el libro de medidores, filtrar un estado y buscar un medidor conocido. | La lista se actualiza y los resultados corresponden al filtro y a la búsqueda. | Prueba que los datos cargan y que los controles de consulta responden; es el punto de entrada al detalle. | ✅ Aprobado. Filtro *Alertas* + búsqueda `M-104` → 1 de 1 medidor (`?estado=ALERT&medidor=M-104`). |
| SM-04 | Abrir el detalle de un medidor. | Coinciden su identificador, estado, consumo, baseline y variación; el histórico está disponible. | Verifica la consistencia de cifras entre listado y detalle (riesgo P2) y que carga el histórico. | ✅ Aprobado. M-104: 1.725,6 kWh · baseline 1.171,7 kWh · +47,3 %, idéntico al listado; histórico de 336 lecturas disponible. |
| SM-05 | Abrir una investigación de anomalía desde una orden. | Se muestran explicación, evidencia, confianza y acción recomendada para el medidor correcto. | Es el valor central del producto (riesgo P1): explicar la anomalía y qué hacer. | ✅ Aprobado. Investigación de M-104: explicación, acción “Validar operación”, confianza 0,86, evidencia y evento relacionado coherentes con el medidor. |
| SM-06 | Ejecutar el análisis de IA, si está habilitado en el entorno. | Se informa el estado de ejecución; al terminar, la vista refleja el resultado o comunica el error sin quedar bloqueada. | Es la única acción que modifica estado y alimenta todo lo anterior (riesgo P2). | ✅ Aprobado. Análisis AN-0003: 7 pasos “Hecho” en 19 ms; resultado 4 anomalías · 2 prioritarias; Despacho mantiene 4 órdenes sin duplicarlas y muestra “AN-0003 · Completado”. |
| SM-07 | Cerrar sesión y volver a abrir una ruta protegida. | La sesión termina y se requiere autenticación para acceder de nuevo. | Es el control de acceso mínimo (riesgo P1 de acceso no autorizado). | ✅ Aprobado. Tras cerrar sesión, `/medidores/M-109` redirigió a `/login`. |
