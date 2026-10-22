const decimal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Replica el formato que usa la UI (es-CO, un decimal) para comparar contra la API.
export function formatKwh(value: number): string {
  return `${decimal.format(value)} kWh`;
}

export function formatVariation(percent: number): string {
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : '';
  return `${sign}${decimal.format(Math.abs(percent))} %`;
}
