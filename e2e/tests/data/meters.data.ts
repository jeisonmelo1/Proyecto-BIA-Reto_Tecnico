import type { StatusFilter } from '../pages/meters.page';

// Dataset de referencia del entorno de pruebas: 12 medidores, 4 anomalías.
export const TOTAL_METERS = 12;
export const DEFAULT_PAGE_SIZE = 10;

export const STATUS_PARTITIONS: ReadonlyArray<{ api: string; ui: StatusFilter; count: number }> = [
  { api: 'NORMAL', ui: 'Normales', count: 8 },
  { api: 'ALERT', ui: 'Alertas', count: 2 },
  { api: 'CRITICAL', ui: 'Críticas', count: 2 },
];

export const CRITICAL_METER_IDS = ['M-109', 'M-112'];

// CB-09: [size, filas esperadas] con 12 medidores (límites y valores vecinos).
export const PAGE_SIZE_BOUNDARIES: ReadonlyArray<[number, number]> = [
  [1, 1],
  [11, 11],
  [12, 12],
  [13, 12],
  [100, 12],
];

export const INVALID_PAGE_SIZES = [101, -1];

// Orden por consumo en 24 h: primeros tres medidores en cada dirección.
export const CONSUMPTION_ASC_FIRST_THREE = ['M-107', 'M-103', 'M-112'];
export const CONSUMPTION_DESC_FIRST_THREE = ['M-109', 'M-104', 'M-106'];

// Fila de referencia del libro de medidores, tal como la muestra la UI (formato es-CO).
export const METER_M109 = {
  id: 'M-109',
  status: 'Crítica',
  severity: 'Alta',
  variation: '+109,8 %',
};

export const SEARCH_TERMS = {
  partialMatch: { term: '109', expectedIds: ['M-109'] },
  noMatch: 'ZZZ',
  lowercase: 'm-109',
};
