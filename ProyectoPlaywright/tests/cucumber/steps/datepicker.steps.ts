import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import { ClickElement } from '../../screenplay/tasks/click_element';
import { ClickDay } from '../../screenplay/tasks/click_day';
import { NavigateToMonth } from '../../screenplay/tasks/navigate_to_month';
import { DatepickerInputValue } from '../../screenplay/questions/datepicker_input_value';
import { Datepicker } from '../../screenplay/ui/datepicker';

When('the user opens the datepicker', async function (this: PlaywrightWorld) {
  await this.actor.attemptsTo(ClickElement.on(Datepicker.inputDatepicker));
});

When('the user selects day {int}', async function (this: PlaywrightWorld, day: number) {
  await this.actor.attemptsTo(ClickDay.number(day));
});

Then('the datepicker field should contain day {int} of the current month', async function (this: PlaywrightWorld, day: number) {
  const value = await this.actor.asksFor(DatepickerInputValue.current());
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const year = now.getFullYear();
  const expectedDate = `${month}/${dayStr}/${year}`;
  expect(value).toBe(expectedDate);
});

Then(/^the datepicker field value should match the format MM\/DD\/YYYY$/, async function (this: PlaywrightWorld) {
  const value = await this.actor.asksFor(DatepickerInputValue.current());
  expect(value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
});

When('the user navigates to month {string}', async function (this: PlaywrightWorld, month: string) {
  await this.actor.attemptsTo(NavigateToMonth.named(month));
});

Then('the datepicker field should show day {int} of month {int} of the current year', async function (this: PlaywrightWorld, day: number, month: number) {
  const value = await this.actor.asksFor(DatepickerInputValue.current());
  const year = new Date().getFullYear();
  const expectedDate = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
  expect(value).toBe(expectedDate);
});
