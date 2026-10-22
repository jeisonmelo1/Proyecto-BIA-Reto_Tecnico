export const INVALID_PASSWORD = 'clave-incorrecta';
export const GARBAGE_TOKEN = 'x.y.z';

export const EXPECTED_TOKEN_TTL_SECONDS = 28800;

export const MESSAGES = {
  invalidCredentials: 'Email o contraseña incorrectos',
  emptyFormUi: 'Escribe tu email y tu contraseña',
  requiredEmail: 'email es obligatorio',
  requiredPassword: 'password es obligatorio',
};

// CB-08: endpoints protegidos que deben responder 401 sin un token válido.
export const PROTECTED_ENDPOINTS: ReadonlyArray<{ method: 'GET' | 'POST'; path: string }> = [
  { method: 'GET', path: 'auth/me' },
  { method: 'GET', path: 'meter/getParams' },
  { method: 'GET', path: 'meter/getById/M-109' },
  { method: 'GET', path: 'anomaly/getAll' },
  { method: 'GET', path: 'dashboard/getSummary' },
  { method: 'GET', path: 'ai/analysis/latest' },
  { method: 'POST', path: 'meter/getAll' },
  { method: 'POST', path: 'ai/analyze' },
];

export const PROTECTED_UI_ROUTE = '/anomalias';
