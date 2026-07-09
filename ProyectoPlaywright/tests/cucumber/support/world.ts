import 'dotenv/config';
import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, chromium, Page } from 'playwright';
import { actorCalled, Actor } from '../../screenplay/actor';
import { BrowseTheWeb } from '../../screenplay/abilities/browse_the_web';

export type PlaywrightWorld = World & {
  actor: Actor;
  browser: Browser;
  page: Page;
  init(): Promise<void>;
  close(): Promise<void>;
};

class CustomWorld {
  public actor!: Actor;
  public browser!: Browser;
  public page!: Page;

  constructor(public readonly parameters: any) {}

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS?.toLowerCase() !== 'false',
    });
    this.page = await this.browser.newPage();
    this.actor = actorCalled('Usuario').whoCan(BrowseTheWeb.with(this.page));
  }

  async close() {
    await this.page?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld as any);
