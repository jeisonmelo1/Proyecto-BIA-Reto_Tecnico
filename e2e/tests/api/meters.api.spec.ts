import { getAllMeters, getMeterById, getMeterPage } from '../actions/api.actions';
import { CONSUMPTION_ASC_FIRST_THREE, CONSUMPTION_DESC_FIRST_THREE, INVALID_PAGE_SIZES, PAGE_SIZE_BOUNDARIES, STATUS_PARTITIONS, TOTAL_METERS } from '../data/meters.data';
import { UNKNOWN_METER_ID } from '../data/anomalies.data';
import { expect, test } from '../fixtures';

test.describe('Medidores (API)', () => {
  for (const [size, expected] of PAGE_SIZE_BOUNDARIES) {
    test(`CB-09 · size=${size} devuelve ${expected} filas`, async ({ authApi }) => {
      const result = await getMeterPage(authApi, { pagination: { page: 1, size } });
      expect(result.rows).toHaveLength(expected);
      expect(result.count).toBe(TOTAL_METERS);
    });
  }

  for (const size of INVALID_PAGE_SIZES) {
    test(`CB-10 · size=${size} se rechaza con 400`, async ({ authApi }) => {
      const response = await getAllMeters(authApi, { pagination: { page: 1, size } });
      expect(response.status()).toBe(400);
    });
  }

  test('CB-11 · página fuera de rango devuelve 0 filas y conserva el total', async ({ authApi }) => {
    const result = await getMeterPage(authApi, { pagination: { page: 7, size: 2 } });
    expect(result.rows).toHaveLength(0);
    expect(result.count).toBe(TOTAL_METERS);
  });

  for (const { api, count } of STATUS_PARTITIONS) {
    test(`CB-13 · status=${api} devuelve ${count} medidores, todos de ese estado`, async ({ authApi }) => {
      const result = await getMeterPage(authApi, { filter: { status: api } });
      expect(result.count).toBe(count);
      expect(result.rows.every((m) => m.status === api)).toBe(true);
    });
  }

  test('CB-13 · status inválido responde 400', async ({ authApi }) => {
    const response = await getAllMeters(authApi, { filter: { status: 'INEXISTENTE' } });
    expect(response.status()).toBe(400);
  });

  test('CB-17 · orden por consumo ascendente y descendente', async ({ authApi }) => {
    const pagination = { page: 1, size: 3 };
    const asc = await getMeterPage(authApi, { filter: { sort_by: 'consumption', sort_order: 'asc' }, pagination });
    const desc = await getMeterPage(authApi, { filter: { sort_by: 'consumption', sort_order: 'desc' }, pagination });

    expect(asc.rows.map((m) => m.meter_id)).toEqual(CONSUMPTION_ASC_FIRST_THREE);
    expect(desc.rows.map((m) => m.meter_id)).toEqual(CONSUMPTION_DESC_FIRST_THREE);
  });

  test('CB-18 · detalle existente 200 y desconocido 404', async ({ authApi }) => {
    expect((await getMeterById(authApi, 'M-109')).status()).toBe(200);
    expect((await getMeterById(authApi, UNKNOWN_METER_ID)).status()).toBe(404);
  });

  test('CB-10 · page=-1 debe validarse con 400 y no con 500 (DEF-01)', async ({ authApi }) => {
    const response = await getAllMeters(authApi, { pagination: { page: -1, size: 10 } });
    expect(response.status()).toBe(400);
  });

  test('CB-10 · size=0 debe rechazarse con 400 (DEF-03)', async ({ authApi }) => {
    const response = await getAllMeters(authApi, { pagination: { page: 1, size: 0 } });
    expect(response.status()).toBe(400);
  });
});
