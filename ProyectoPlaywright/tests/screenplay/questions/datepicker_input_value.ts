import { Question } from '../actor';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import { Datepicker } from '../ui/datepicker';

export class DatepickerInputValue implements Question<string> {
  static current(): DatepickerInputValue {
    return new DatepickerInputValue();
  }

  async answeredBy(actor: Parameters<Question<string>['answeredBy']>[0]): Promise<string> {
    const page = actor.abilityTo(BrowseTheWeb).page;
    return Datepicker.inputDatepicker(page).inputValue();
  }
}
