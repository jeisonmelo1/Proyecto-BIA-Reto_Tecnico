import { createApiContext } from '../actions/api.actions';
import { env } from '../config/env';
import { EXPECTED_TOKEN_TTL_SECONDS, GARBAGE_TOKEN, INVALID_PASSWORD, MESSAGES, PROTECTED_ENDPOINTS } from '../data/auth.data';
import { expect, test } from '../fixtures';

test.describe('Autenticación (API)', () => {
  test('CB-01 · login válido devuelve token Bearer con vigencia de 8 h', async ({ api }) => {
    const response = await api.post('auth/login', { data: { email: env.adminEmail, password: env.adminPassword } });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token_type?.toLowerCase()).toBe('bearer');
    expect(body.access_token).toBeTruthy();
    expect(body.expires_in).toBe(EXPECTED_TOKEN_TTL_SECONDS);
  });

  test('CB-02 · contraseña incorrecta responde 401 con mensaje genérico', async ({ api }) => {
    const response = await api.post('auth/login', { data: { email: env.adminEmail, password: INVALID_PASSWORD } });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe(MESSAGES.invalidCredentials);
  });

  test('CB-03 · campos vacíos responden 400 con el detalle por campo', async ({ api }) => {
    const response = await api.post('auth/login', { data: { email: '', password: '' } });

    expect(response.status()).toBe(400);
    expect((await response.json()).errors).toEqual(
      expect.arrayContaining([MESSAGES.requiredEmail, MESSAGES.requiredPassword]),
    );
  });

  for (const { method, path } of PROTECTED_ENDPOINTS) {
    test(`CB-08 · ${method} ${path} sin token responde 401`, async ({ api }) => {
      const response = await api.fetch(path, { method });
      expect(response.status()).toBe(401);
    });

    test(`CB-08 · ${method} ${path} con token basura responde 401`, async ({ playwright }) => {
      const context = await createApiContext(playwright, GARBAGE_TOKEN);
      const response = await context.fetch(path, { method });
      expect(response.status()).toBe(401);
      await context.dispose();
    });
  }
});
