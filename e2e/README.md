# Automatización E2E

## Descripción

Pruebas automatizadas de **EnergIA** (UI y API) con **Playwright Test** y el patrón **Page Object Model (POM)**. Los tests son archivos `*.spec.ts` que se ejecutan directamente con el runner de Playwright; no usan Cucumber ni Gherkin. El plan y la documentación de QA están en `../qa/`.

## Estructura

```
e2e/
├── package.json
├── playwright.config.ts      # proyecto `setup` + proyectos de navegador, reportes, evidencias
├── tsconfig.json
├── .env.example              # plantilla de variables (el .env real no se versiona)
├── playwright/.auth/         # sesión guardada por `setup` (storageState, no se versiona)
└── tests/
    ├── config/env.ts         # lectura de variables de entorno
    ├── setup/auth.setup.ts   # inicia sesión UNA vez y guarda storageState
    ├── data/                 # datos de prueba y resultados esperados (separados de los specs)
    ├── types/api.types.ts    # tipos de las respuestas de la API
    ├── utils/format.ts       # formato es-CO de la UI para comparar con la API
    ├── actions/              # funciones propias sobre Playwright, reutilizables
    │   ├── element.actions.ts     # clickOn, fillIn, selectByLabel
    │   ├── navigation.actions.ts  # buildUrl, goTo, waitForPathLeave
    │   ├── network.actions.ts     # actAndWaitForResponse
    │   ├── auth.actions.ts        # loginViaUi
    │   ├── api.actions.ts         # createApiContext, apiLogin, getMeterPage, getAnomalies…
    │   └── index.ts               # exporta todo para usar en specs
    ├── pages/                # Page Objects (locators + acciones de cada pantalla)
    │   ├── base.page.ts
    │   ├── login.page.ts
    │   ├── dispatch.page.ts  # Despacho + barra de navegación
    │   └── meters.page.ts    # Libro de medidores
    ├── fixtures/index.ts     # fixtures: páginas y clientes API
    ├── ui/                   # specs de UI
    └── api/                  # specs de API (fixture request de Playwright)
```

### Reglas del POM en este proyecto

- Los **locators y las acciones de pantalla** viven en `tests/pages/`; los specs no contienen selectores.
- Las **funciones genéricas sobre Playwright** (clics, formularios, navegación, esperas de red, sesión y llamadas a la API) viven en `tests/actions/`. Los page objects, fixtures y specs las reutilizan en lugar de llamar directamente a `click()`, `fill()` o `waitForResponse()`.
- Dentro de `pages/` y `actions/` se importa desde el archivo concreto (no desde `actions/index.ts`) para evitar dependencias circulares; los specs y fixtures pueden usar el índice.
- Los **asserts** viven en los specs, no en los page objects ni en las acciones; son *web-first* (`expect(locator)…`) y verifican datos de negocio (estados, conteos, valores UI vs API).
- Sin `waitForTimeout`: se usan las esperas automáticas y la espera de la respuesta de red (`MetersPage.afterReload`).
- Locators por rol y nombre accesible (`getByRole`, `getByLabel`), nunca CSS frágil.
- **Login reutilizable:** el proyecto `setup` inicia sesión una vez y guarda `storageState`; los proyectos de navegador dependen de él. Los tests de login parten sin sesión con `test.use({ storageState: ANONYMOUS })`.
- Los **datos esperados** están en `tests/data/`, no incrustados en los tests.

### Fixtures disponibles

| Fixture | Uso |
|---|---|
| `loginPage`, `dispatchPage`, `metersPage` | Page objects ya instanciados |
| `api` | Cliente HTTP sin autenticar (base `API_URL`) |
| `authApi` | Cliente HTTP con `Authorization: Bearer` (token por worker) |

## Casos implementados

Trazados a `../qa/03-casos-caja-negra.md`:

| Archivo | Casos |
|---|---|
| `tests/ui/login.spec.ts` | CB-01, CB-02, CB-03, CB-08, cierre de sesión |
| `tests/ui/meters.spec.ts` | CB-12 (DEF-05), CB-13, CB-14, CB-15 (DEF-02), CB-16, CB-17, CB-23 |
| `tests/api/auth.api.spec.ts` | CB-01, CB-02, CB-03, CB-08 (8 endpoints × sin token / token basura) |
| `tests/api/meters.api.spec.ts` | CB-09, CB-10 (DEF-01, DEF-03), CB-11, CB-13, CB-17, CB-18 |
| `tests/api/anomalies.api.spec.ts` | CB-19 (tabla de decisión), CB-20, CB-22 |

Los tests marcados con `test.fail` documentan un **defecto conocido**: pasan mientras el defecto exista y fallan («Expected to fail, but passed») cuando se corrija, para que se retire la marca.


## Requisitos previos

- Node.js 18 o superior.
- EnergIA en ejecución: UI en `http://localhost:5173` y API en `http://localhost:8080`.
- Desde `e2e/`:
  ```bash
  npm install
  npx playwright install
  ```
- Crear `.env` a partir de `.env.example` y completar las credenciales de la cuenta de pruebas. `.env` está ignorado por git; no versionar credenciales.
  ```
  HEADLESS=true
  BASE_URL=http://localhost:5173
  API_URL=http://localhost:8080/api/v1
  ADMIN_EMAIL=
  ADMIN_PASSWORD=
  ```

## Ejecución

```bash
npm test                 # todo, en todos los navegadores
npm run test:ui          # solo UI
npm run test:api         # solo API
npm run test:chromium    # un solo navegador
npx playwright test --project=firefox tests/ui/login.spec.ts
npx playwright test -g "CB-13"          # por nombre/ID
npm run typecheck        # verificación de tipos
npm run report           # abrir el reporte HTML
```

### Navegadores (proyectos)

`chromium`, `firefox`, `webkit`, `chrome` (Google Chrome instalado) y `edge` (Microsoft Edge instalado). Los dos últimos requieren el navegador instalado en el equipo; si no, ejecutar con `--project=chromium` o instalarlos con `npx playwright install chrome msedge`.

### Evidencias

Se guardan captura y video solo cuando un test falla (`test-results/`), traza en el primer reintento y el reporte HTML en `playwright-report/`.

## Debug

- **VS Code:** Run and Debug → «Debug: archivo de prueba actual», con el spec abierto.
- **Terminal:**
  ```powershell
  $env:HEADLESS="false"; npx playwright test tests/ui/login.spec.ts --project=chromium --debug
  ```
- **UI mode:** `npx playwright test --ui`.
