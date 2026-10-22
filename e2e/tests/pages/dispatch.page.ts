import { Locator, Page } from '@playwright/test';
import { clickOn } from '../actions/element.actions';
import { BasePage } from './base.page';

export class NavBar {
  readonly dispatchLink: Locator;
  readonly metersLink: Locator;
  readonly anomaliesLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    const nav = page.getByRole('navigation', { name: 'Principal' });
    this.dispatchLink = nav.getByRole('link', { name: 'Despacho' });
    this.metersLink = nav.getByRole('link', { name: 'Medidores' });
    this.anomaliesLink = nav.getByRole('link', { name: 'Anomalías IA' });
    this.logoutButton = page.getByRole('button', { name: 'Cerrar sesión' });
  }
}

export class DispatchPage extends BasePage {
  protected readonly path = '/';

  readonly navBar: NavBar;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = new NavBar(page);
    this.heading = page.getByRole('heading', { name: 'Despacho' });
  }

  async logout(): Promise<void> {
    await clickOn(this.navBar.logoutButton);
  }
}
