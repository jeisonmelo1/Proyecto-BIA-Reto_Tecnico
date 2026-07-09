import { Task } from '../actor';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Datepicker } from '../ui/datepicker';

export class ClickDay {
  constructor(private readonly day: number) {}

  static number(day: number): Task {
    return new ClickDay(day);
  }

  async performAs(actor: Parameters<Task['performAs']>[0]) {
    const page = actor.abilityTo(BrowseTheWeb).page;
    const locator = Datepicker.dayByText(page, this.day);
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }
}
