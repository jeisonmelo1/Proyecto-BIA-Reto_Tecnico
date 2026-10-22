import { Page, Response } from '@playwright/test';

export type ResponseMatcher = { urlPart: string; method?: string };

// Ejecuta la acción y espera la respuesta de red que ella dispara, para no leer datos desactualizados.
export async function actAndWaitForResponse(
  page: Page,
  action: () => Promise<unknown>,
  { urlPart, method = 'POST' }: ResponseMatcher,
): Promise<Response> {
  const response = page.waitForResponse(
    (r) => r.url().includes(urlPart) && r.request().method() === method,
  );
  await action();
  return response;
}
