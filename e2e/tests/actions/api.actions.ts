import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { env } from '../config/env';
import type { Anomaly, DashboardSummary, MeterPageResult } from '../types/api.types';

// La barra final hace que las rutas relativas («auth/login») se resuelvan bajo /api/v1.
const baseURL = `${env.apiUrl}/`;

// Es el objeto `playwright` que inyecta el runner; solo se necesita su `request`.
export type PlaywrightRequestFactory = { request: typeof request };

export async function createApiContext(
  playwright: PlaywrightRequestFactory,
  token?: string,
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiLogin(
  playwright: PlaywrightRequestFactory,
  email: string = env.adminEmail,
  password: string = env.adminPassword,
): Promise<string> {
  const context = await createApiContext(playwright);
  try {
    const response = await context.post('auth/login', { data: { email, password } });
    if (!response.ok()) {
      throw new Error(`Login por API falló con estado ${response.status()}`);
    }
    return (await response.json()).access_token as string;
  } finally {
    await context.dispose();
  }
}

export async function postJson(
  context: APIRequestContext,
  path: string,
  body: object,
): Promise<APIResponse> {
  return context.post(path, { data: body });
}

export interface PageRequest {
  page?: number;
  size?: number;
}

export interface MeterFilter {
  meter_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export async function getAllMeters(
  context: APIRequestContext,
  options: { filter?: MeterFilter; pagination?: PageRequest } = {},
): Promise<APIResponse> {
  return postJson(context, 'meter/getAll', options);
}

export async function getMeterPage(
  context: APIRequestContext,
  options: { filter?: MeterFilter; pagination?: PageRequest } = {},
): Promise<MeterPageResult> {
  return (await getAllMeters(context, options)).json();
}

export async function getMeterById(context: APIRequestContext, id: string): Promise<APIResponse> {
  return context.get(`meter/getById/${id}`);
}

export async function getAnomalies(context: APIRequestContext): Promise<Anomaly[]> {
  return (await context.get('anomaly/getAll')).json();
}

export async function getDashboardSummary(context: APIRequestContext): Promise<DashboardSummary> {
  return (await context.get('dashboard/getSummary')).json();
}
