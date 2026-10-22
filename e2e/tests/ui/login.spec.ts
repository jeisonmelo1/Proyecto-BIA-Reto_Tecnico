import { ANONYMOUS, expect, test } from '../fixtures';
import { env } from '../config/env';
import { INVALID_PASSWORD, MESSAGES, PROTECTED_UI_ROUTE } from '../data/auth.data';

// Estos escenarios parten sin sesión: no usan el estado guardado por `setup`.
test.use({ storageState: ANONYMOUS });

test.describe('Login (UI)', () => {
  test('CB-01 · credenciales válidas llevan al Despacho con la sesión activa', async ({
    loginPage,
    dispatchPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(env.adminEmail, env.adminPassword);

    await expect(page).toHaveURL('/');
    await expect(dispatchPage.heading).toBeVisible();
    await expect(dispatchPage.navBar.logoutButton).toBeEnabled();
  });

  test('CB-02 · contraseña incorrecta muestra error genérico y no abre sesión', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login(env.adminEmail, INVALID_PASSWORD);

    await expect(loginPage.errorAlert).toContainText(MESSAGES.invalidCredentials);
    await expect(page).toHaveURL(/\/login/);
    await page.goto(PROTECTED_UI_ROUTE);
    await expect(page).toHaveURL(/\/login/);
  });

  test('CB-03 · formulario vacío pide email y contraseña sin autenticar', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.submitButton.click();

    await expect(loginPage.errorAlert).toContainText(MESSAGES.emptyFormUi);
    await expect(page).toHaveURL(/\/login/);
  });

  test('CB-08 · una ruta protegida sin sesión redirige a /login', async ({ page, loginPage }) => {
    await page.goto(PROTECTED_UI_ROUTE);

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.heading).toBeVisible();
  });
});

test.describe('Cierre de sesión (UI)', () => {
  test.use({ storageState: env.authFile });

  test('cerrar sesión devuelve a /login y bloquea las rutas protegidas', async ({
    dispatchPage,
    page,
  }) => {
    await dispatchPage.open();
    await dispatchPage.logout();
    await expect(page).toHaveURL(/\/login/);

    await page.goto(PROTECTED_UI_ROUTE);
    await expect(page).toHaveURL(/\/login/);
  });
});
