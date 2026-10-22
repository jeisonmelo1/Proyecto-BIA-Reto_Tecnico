import { getMeterById } from '../actions/api.actions';
import { DEFAULT_PAGE_SIZE, CONSUMPTION_ASC_FIRST_THREE, CONSUMPTION_DESC_FIRST_THREE, CRITICAL_METER_IDS, METER_M109, SEARCH_TERMS, STATUS_PARTITIONS, TOTAL_METERS } from '../data/meters.data';
import { expect, test } from '../fixtures';
import type { MeterSummary } from '../types/api.types';
import { formatKwh, formatVariation } from '../utils/format';

// Sesión reutilizada desde `storageState`: no hay login en cada test.
test.describe('Libro de medidores (UI)', () => {
  test.beforeEach(async ({ metersPage }) => {
    await metersPage.open();
    await expect(metersPage.rows).toHaveCount(DEFAULT_PAGE_SIZE);
  });

  for (const { ui, count } of STATUS_PARTITIONS) {
    test(`CB-13 · el filtro «${ui}» muestra exactamente ${count} medidores de ese estado`, async ({ metersPage }) => {
      await metersPage.filterByStatus(ui);

      await expect(metersPage.statusOption(ui)).toBeChecked();
      await expect(metersPage.rows).toHaveCount(count);
      await expect(metersPage.pagination).toContainText(`de ${count} medidores`);
    });
  }

  test('CB-13 · «Críticas» lista solo M-109 y M-112', async ({ metersPage }) => {
    await metersPage.filterByStatus('Críticas');

    await expect(metersPage.meterLinks).toHaveText(CRITICAL_METER_IDS);
  });

  test('CB-14 · búsqueda parcial devuelve el medidor que contiene el texto', async ({ metersPage }) => {
    const { term, expectedIds } = SEARCH_TERMS.partialMatch;
    await metersPage.search(term);

    await expect(metersPage.meterLinks).toHaveText(expectedIds);
  });

  test('CB-14 · búsqueda sin coincidencias muestra el estado vacío y oculta la tabla', async ({ metersPage }) => {
    await metersPage.search(SEARCH_TERMS.noMatch);

    await expect(metersPage.emptyState).toBeVisible();
    await expect(metersPage.rows).toHaveCount(0);
  });

  test('CB-16 · estado + medidor se combinan (AND)', async ({ metersPage }) => {
    await metersPage.openWith({ estado: 'CRITICAL', medidor: '109' });

    await expect(metersPage.meterLinks).toHaveText(['M-109']);
    await expect(metersPage.pagination).toContainText('1–1 de 1 medidores');
  });

  test('CB-12 · paginación: 12 medidores se reparten en 10 + 2 (navegando por URL)', async ({ metersPage }) => {
    await expect(metersPage.pagination).toContainText(`1–${DEFAULT_PAGE_SIZE} de ${TOTAL_METERS} medidores`);
    await expect(metersPage.previousPageButton).toBeDisabled();

    await metersPage.openWith({ pagina: '2' });

    await expect(metersPage.rows).toHaveCount(TOTAL_METERS - DEFAULT_PAGE_SIZE);
    await expect(metersPage.pagination).toContainText(`11–${TOTAL_METERS} de ${TOTAL_METERS} medidores`);
    await expect(metersPage.previousPageButton).toBeEnabled();
  });

  // Defecto conocido DEF-05: en la primera página «Siguiente» queda deshabilitado aunque hay más resultados.
  test.fail('CB-12 · «Siguiente» está habilitado en la página 1 de 2 (DEF-05)', async ({ metersPage }) => {
    await expect(metersPage.nextPageButton).toBeEnabled({ timeout: 3000 });
  });

  test('CB-17 · orden por consumo en ambas direcciones', async ({ metersPage }) => {
    await metersPage.sortBy('Consumo');
    await expect(metersPage.meterLinks.first()).toHaveText(CONSUMPTION_ASC_FIRST_THREE[0]);
    await expect(metersPage.meterLinks).toContainText(CONSUMPTION_ASC_FIRST_THREE, { useInnerText: true });

    await metersPage.toggleSortDirection();

    await expect(metersPage.meterLinks.first()).toHaveText(CONSUMPTION_DESC_FIRST_THREE[0]);
  });

  test('CB-23 · la fila de M-109 muestra lo mismo que devuelve la API', async ({ metersPage, authApi }) => {
    const meter: MeterSummary = await (await getMeterById(authApi, METER_M109.id)).json();

    await metersPage.search(METER_M109.id);

    const cells = metersPage.rowCells(METER_M109.id);
    const expected = [
      METER_M109.status,
      formatKwh(meter.consumption_kwh),
      formatKwh(meter.baseline_kwh),
      formatVariation(meter.variation_pct),
      METER_M109.severity,
    ];
    for (const [index, text] of expected.entries()) {
      await expect(cells.nth(index)).toHaveText(text);
    }
    expect(formatVariation(meter.variation_pct)).toBe(METER_M109.variation);
  });

  // Defecto conocido DEF-02: la búsqueda no ignora mayúsculas pese a lo documentado.
  test.fail('CB-15 · buscar «m-109» en minúsculas debe encontrar M-109 (DEF-02)', async ({ metersPage }) => {
    await metersPage.search(SEARCH_TERMS.lowercase);

    await expect(metersPage.meterLinks).toHaveText(['M-109']);
  });
});
