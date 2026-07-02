import { CurrencyInfo, Grouping, getCurrency, DEFAULT_CURRENCY } from '../constants/currencies';

// Module-level "active" currency. Set once from settings on app load and again
// whenever the user changes country in Settings, so plain formatters stay simple.
let active: CurrencyInfo = getCurrency(DEFAULT_CURRENCY);

export function setActiveCurrency(code: string | null | undefined): void {
  active = getCurrency(code);
}

export function getActiveCurrency(): CurrencyInfo {
  return active;
}

export function currencySymbol(): string {
  return active.symbol;
}

function trim(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

function compactStd(abs: number): string | null {
  if (abs >= 1e9) return `${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${trim(abs / 1e6)}M`;
  if (abs >= 1e3) return `${trim(abs / 1e3)}K`;
  return null;
}

function compactIndian(abs: number): string | null {
  if (abs >= 1e7) return `${trim(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${trim(abs / 1e5)}L`;
  if (abs >= 1e3) return `${trim(abs / 1e3)}K`;
  return null;
}

function groupInt(intStr: string, grouping: Grouping): string {
  if (grouping === 'in') {
    if (intStr.length <= 3) return intStr;
    const last3 = intStr.slice(-3);
    const rest = intStr.slice(0, -3);
    return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
  }
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats an amount in the active currency: symbol + locale-appropriate grouping.
 * `compact` yields K/M/B (or K/L/Cr for Indian-grouped currencies) for large sums.
 */
export function formatMoney(amount: number, compact = false): string {
  const c = active;
  const neg = amount < 0;
  const abs = Math.abs(amount);
  const sign = neg ? '-' : '';

  if (compact) {
    const compactStr = c.grouping === 'in' ? compactIndian(abs) : compactStd(abs);
    if (compactStr) return `${sign}${c.symbol}${compactStr}`;
  }

  const fixed = abs.toFixed(c.decimals);
  const [intRaw, fracRaw] = fixed.split('.');
  const intPart = groupInt(intRaw, c.grouping);
  // Trim trailing zeros (12.00 -> 12, 12.50 -> 12.5) to match prior behavior.
  const frac = fracRaw ? fracRaw.replace(/0+$/, '') : '';
  const numStr = frac ? `${intPart}.${frac}` : intPart;
  return `${sign}${c.symbol}${numStr}`;
}
