import { Page } from '@playwright/test';
import { env } from '../config/env';
import { LoginPage } from '../pages/login.page';
import { waitForPathLeave } from './navigation.actions';

export async function loginViaUi(
  page: Page,
  email: string = env.adminEmail,
  password: string = env.adminPassword,
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(email, password);
  await waitForPathLeave(page, '/login');
}
