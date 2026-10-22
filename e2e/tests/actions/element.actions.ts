import { Locator } from '@playwright/test';

export async function clickOn(target: Locator): Promise<void> {
  await target.click();
}

export async function fillIn(target: Locator, value: string): Promise<void> {
  await target.fill(value);
}

export async function selectByLabel(target: Locator, label: string): Promise<void> {
  await target.selectOption({ label });
}
