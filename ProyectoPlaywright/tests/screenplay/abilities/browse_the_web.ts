import { Page } from 'playwright';
import { Ability } from './ability';

export class BrowseTheWeb implements Ability {
  constructor(public readonly page: Page) {}

  static with(page: Page) {
    return new BrowseTheWeb(page);
  }
}
