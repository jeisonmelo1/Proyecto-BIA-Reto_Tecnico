import { Page } from '@playwright/test';

export type QueryParams = Record<string, string | undefined>;

export function buildUrl(path: string, params: QueryParams = {}): string {
  const defined = Object.entries(params).filter(([, value]) => value !== undefined) as [string, string][];
  const query = new URLSearchParams(defined).toString();
  return query ? `${path}?${query}` : path;
}

export async function goTo(page: Page, path: string, params: QueryParams = {}): Promise<void> {
  await page.goto(buildUrl(path, params));
}

export async function waitForPathLeave(page: Page, path: string): Promise<void> {
  await page.waitForURL((url) => !url.pathname.startsWith(path));
}
