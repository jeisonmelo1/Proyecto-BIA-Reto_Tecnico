
# ProyectoPlaywright

## Descripción

Framework de automatización de pruebas basado en el patrón **Screenplay** con **Cucumber** y **Playwright**.

## Estructura del proyecto

```
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── cucumber.js
├── sonar-project.properties
├── .vscode/
│   └── launch.json
└── tests/
    ├── features/
    │   └── datepicker.feature
    ├── cucumber/
    │   ├── steps/
    │   │   ├── common.steps.ts
    │   │   └── datepicker.steps.ts
    │   └── support/
    │       ├── hooks.ts
    │       └── world.ts
    └── screenplay/
        ├── actor.ts
        ├── abilities/
        │   ├── ability.ts
        │   └── browse_the_web.ts
        ├── questions/
        │   └── datepicker_input_value.ts
        ├── tasks/
        │   ├── click_day.ts
        │   ├── click_element.ts
        │   ├── navigate.ts
        │   └── navigate_to_month.ts
        └── ui/
            └── datepicker.ts
```

## Patrón Screenplay

| Capa | Responsabilidad | Ubicación |
|---|---|---|
| **Actor** | Orquesta abilities, tasks y questions | `screenplay/actor.ts` |
| **Abilities** | Capacidades del actor (ej. navegar) | `screenplay/abilities/` |
| **Tasks** | Acciones que el actor realiza | `screenplay/tasks/` |
| **Questions** | Consultas sobre el estado del sistema | `screenplay/questions/` |
| **UI** | Page objects con locators | `screenplay/ui/` |

## Casos de prueba implementados

| ID | Descripción | Tag |
|---|---|---|
| CP-01 | Seleccionar día 15 del mes actual | `@datepicker` |
| CP-02 | Navegar a un mes diferente (Diciembre) y seleccionar día 15 | `@datepicker` |
| CP-06 | Validar que la fecha almacenada tenga formato MM/DD/YYYY | `@datepicker` |

## Requisitos previos

- Node.js 18 o superior
- Instalar dependencias:
  ```bash
  npm install
  ```
- Instalar navegadores de Playwright:
  ```bash
  npx playwright install
  ```
- Configurar `.env`:
  ```
  HEADLESS=false
  ```

## Ejecución de pruebas

### Todos los escenarios
```bash
npm run test:cucumber
```

### Por tag
```bash
npm run test:cucumber -- --tags "@datepicker"
```

### Combinar tags
```bash
npm run test:cucumber -- --tags "@datepicker and not @wip"
```

### Con reporte de cobertura
```bash
npm run test:coverage
```

## Análisis de calidad con SonarQube

```bash
npm run sonar
```

Requiere SonarQube corriendo en `http://localhost:9000` y el token configurado en `sonar-project.properties`.

## Debug

### VS Code Debugger (recomendado)
1. Abre **Run and Debug** (`Ctrl+Shift+D`)
2. Selecciona **"Debug: @datepicker"** en el dropdown
3. Presiona **F5**

El debugger abre el **Playwright Inspector** (`PWDEBUG=1`) que permite pausar, inspeccionar locators y avanzar paso a paso. Los breakpoints en archivos `.ts` son respetados.

### Terminal
```powershell
$env:PWDEBUG="1"; $env:HEADLESS="false"; npm run test:cucumber -- --tags "@datepicker"
```
