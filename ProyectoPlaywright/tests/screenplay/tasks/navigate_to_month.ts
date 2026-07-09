import { Task } from '../actor';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Datepicker } from '../ui/datepicker';

const MAX_NAVIGATION_CLICKS = 24;

export class NavigateToMonth {
  constructor(private readonly targetMonth: string) {}

  static named(month: string): Task {
    return new NavigateToMonth(month);
  }

  async performAs(actor: Parameters<Task['performAs']>[0]) {
    const page = actor.abilityTo(BrowseTheWeb).page;

    await Datepicker.monthDisplay(page).waitFor({ state: 'visible', timeout: 10000 });

    for (let i = 0; i < MAX_NAVIGATION_CLICKS; i++) {
      const currentMonth = await Datepicker.monthDisplay(page).textContent();
      if (currentMonth?.trim() === this.targetMonth) break;
      await Datepicker.buttonNext(page).click();
    }
  }
}
