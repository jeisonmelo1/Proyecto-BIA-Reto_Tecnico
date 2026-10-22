import { Page } from '@playwright/test';
import { goTo, QueryParams } from '../actions/navigation.actions';

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(params: QueryParams = {}): Promise<void> {
    await goTo(this.page, this.path, params);
  }

  protected get alert() {
    return this.page.getByRole('alert');
  }
}
