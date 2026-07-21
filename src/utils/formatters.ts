/**
 * Formats a number as Brazilian Real currency.
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formats a number as a compact Brazilian Real currency (no decimals for large values).
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return formatCurrency(value);
}

/**
 * Formats a percentage value.
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
