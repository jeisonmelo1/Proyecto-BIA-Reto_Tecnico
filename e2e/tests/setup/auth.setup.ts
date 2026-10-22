import { test as setup } from '@playwright/test';
import { loginViaUi } from '../actions/auth.actions';
import { env } from '../config/env';

setup('iniciar sesión y guardar el estado', async ({ page }) => {
  await loginViaUi(page);
  await page.context().storageState({ path: env.authFile });
});
