import { Locator, Page } from '@playwright/test';
import { Actor } from '../actor';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export type LocatorFactory = (page: Page) => Locator;

export class ClickElement {
  constructor(private readonly locatorFactory: LocatorFactory) {}

  static on(locatorFactory: LocatorFactory, force: boolean = false) {
    return new ClickElement(locatorFactory);
  }

  async performAs(actor: Actor) {
    const page = actor.abilityTo(BrowseTheWeb).page;
    const locator = this.locatorFactory(page);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }
}
