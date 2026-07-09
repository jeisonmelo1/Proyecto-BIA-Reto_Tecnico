import { FrameLocator, Locator, Page } from '@playwright/test';

const FRAME_SELECTOR = 'iframe.demo-frame';

const frame = (page: Page): FrameLocator => page.frameLocator(FRAME_SELECTOR);

export const Datepicker = {
  inputDatepicker: (page: Page): Locator => frame(page).locator("//*[@id='datepicker']"),
  buttonPrev:      (page: Page): Locator => frame(page).locator("//*[contains(@class,'ui-datepicker-prev')]"),
  buttonNext:      (page: Page): Locator => frame(page).locator("//*[contains(@class,'ui-datepicker-next')]"),
  monthDisplay:    (page: Page): Locator => frame(page).locator("//*[contains(@class,'ui-datepicker-month')]"),
  dayByIndex:      (page: Page, index: number): Locator => frame(page).locator(`(//*[@data-handler='selectDay'])[${index}]`),
  dayByText:       (page: Page, day: number): Locator   => frame(page).locator(`//*[@data-handler='selectDay'][normalize-space()='${day}']`),
};
