import { Locator, Page } from '@playwright/test';
import { clickOn, fillIn, selectByLabel } from '../actions/element.actions';
import { actAndWaitForResponse } from '../actions/network.actions';
import { BasePage } from './base.page';

export type StatusFilter = 'Todos' | 'Normales' | 'Alertas' | 'Críticas';
export type SortOption = 'Medidor' | 'Consumo' | 'Variación' | 'Severidad';

export class MetersPage extends BasePage {
  protected readonly path = '/medidores';

  readonly statusGroup: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sortSelect: Locator;
  readonly sortDirectionButton: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly meterLinks: Locator;
  readonly emptyState: Locator;
  readonly pagination: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.statusGroup = page.getByRole('group', { name: 'Estado' });
    this.searchInput = page.getByRole('combobox', { name: 'Medidor' });
    this.searchButton = page.getByRole('button', { name: 'Buscar medidor' });
    this.sortSelect = page.getByRole('combobox', { name: 'Ordenar por' });
    this.sortDirectionButton = page.getByRole('button', { name: /^Dirección/ });
    this.table = page.getByRole('table', { name: 'Medidores filtrados' });
    // Las filas de datos tienen un `rowheader` (el ID del medidor); la cabecera no.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('rowheader') });
    this.meterLinks = this.rows.getByRole('link');
    this.emptyState = page.getByText('Ningún medidor coincide con los filtros');
    this.pagination = page.getByRole('navigation', { name: 'Paginación' });
    this.nextPageButton = this.pagination.getByRole('button', { name: 'Siguiente' });
    this.previousPageButton = this.pagination.getByRole('button', { name: 'Anterior' });
  }

  statusOption(status: StatusFilter): Locator {
    return this.statusGroup.getByRole('radio', { name: status });
  }

  row(meterId: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('link', { name: meterId, exact: true }) });
  }

  rowCells(meterId: string): Locator {
    return this.row(meterId).getByRole('cell');
  }

  async openWith(params: { estado?: string; medidor?: string; pagina?: string }): Promise<void> {
    await this.open(params);
  }

  async filterByStatus(status: StatusFilter): Promise<void> {
    // El radio nativo está oculto: se pulsa su etiqueta visible.
    const label = this.statusGroup.getByText(status, { exact: true });
    await this.afterReload(() => clickOn(label));
  }

  async search(term: string): Promise<void> {
    await fillIn(this.searchInput, term);
    await this.afterReload(() => clickOn(this.searchButton));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.afterReload(() => selectByLabel(this.sortSelect, option));
  }

  async toggleSortDirection(): Promise<void> {
    await this.afterReload(() => clickOn(this.sortDirectionButton));
  }

  async goToNextPage(): Promise<void> {
    await this.afterReload(() => clickOn(this.nextPageButton));
  }

  // Espera la respuesta de red de la acción (basada en eventos, sin esperas fijas).
  private afterReload(action: () => Promise<unknown>) {
    return actAndWaitForResponse(this.page, action, { urlPart: '/meter/getAll' });
  }
}
