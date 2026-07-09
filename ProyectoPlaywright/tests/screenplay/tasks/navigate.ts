import { Actor } from '../actor';
import { BrowseTheWeb } from '../abilities/browse_the_web';

export class Navigate {
  constructor(private readonly url: string) {}

  static to(url: string) {
    return new Navigate(url);
  }

  async performAs(actor: Actor) {
    const page = actor.abilityTo(BrowseTheWeb).page;
    await page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }
}
