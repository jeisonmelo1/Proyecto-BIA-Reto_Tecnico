import { APIRequestContext, test as base } from '@playwright/test';
import { apiLogin, createApiContext } from '../actions/api.actions';
import { DispatchPage } from '../pages/dispatch.page';
import { LoginPage } from '../pages/login.page';
import { MetersPage } from '../pages/meters.page';

type PageFixtures = {
  loginPage: LoginPage;
  dispatchPage: DispatchPage;
  metersPage: MetersPage;
};

type ApiFixtures = {
  api: APIRequestContext;
  authApi: APIRequestContext;
};

type WorkerFixtures = {
  token: string;
};

// La sesión de UI llega ya cargada desde `storageState` (proyecto `setup`);
// los tests que necesiten estar sin sesión usan `test.use({ storageState: ANONYMOUS })`.
export const ANONYMOUS = { cookies: [], origins: [] };

export const test = base.extend<PageFixtures & ApiFixtures, WorkerFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dispatchPage: async ({ page }, use) => use(new DispatchPage(page)),
  metersPage: async ({ page }, use) => use(new MetersPage(page)),

  api: async ({ playwright }, use) => {
    const context = await createApiContext(playwright);
    await use(context);
    await context.dispose();
  },

  token: [
    async ({ playwright }, use) => use(await apiLogin(playwright)),
    { scope: 'worker' },
  ],

  authApi: async ({ playwright, token }, use) => {
    const context = await createApiContext(playwright, token);
    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
