import { Locator, Page } from '@playwright/test';
import { clickOn, fillIn } from '../actions/element.actions';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Iniciar sesión' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
    this.errorAlert = this.alert;
  }

  async login(email: string, password: string): Promise<void> {
    await fillIn(this.emailInput, email);
    await fillIn(this.passwordInput, password);
    await clickOn(this.submitButton);
  }
}
