// Currency + country data for Ginti's global audience. Formatting is done
// manually (symbol + grouping) rather than relying on Intl, which is only
// partially available on Hermes — this keeps output identical across devices.

export type Grouping = 'std' | 'in'; // 'in' = Indian lakh/crore grouping

export interface CurrencyInfo {
  code: string; // ISO 4217, e.g. 'USD'
  symbol: string;
  decimals: number; // fraction digits (0 for JPY/KRW/VND, else 2)
  grouping: Grouping;
}

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2, e.g. 'US'
  name: string;
  flag: string; // emoji
  currency: string; // ISO 4217 code, links into CURRENCIES
}

export const DEFAULT_COUNTRY = 'US';
export const DEFAULT_CURRENCY = 'USD';

// Keyed by ISO 4217. Only currencies referenced by COUNTRIES need entries; a
// safe fallback is applied for anything missing.
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, grouping: 'std' },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, grouping: 'std' },
  GBP: { code: 'GBP', symbol: '£', decimals: 2, grouping: 'std' },
  INR: { code: 'INR', symbol: '₹', decimals: 2, grouping: 'in' },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, grouping: 'std' },
  CNY: { code: 'CNY', symbol: '¥', decimals: 2, grouping: 'std' },
  AUD: { code: 'AUD', symbol: 'A$', decimals: 2, grouping: 'std' },
  CAD: { code: 'CAD', symbol: 'C$', decimals: 2, grouping: 'std' },
  CHF: { code: 'CHF', symbol: 'CHF', decimals: 2, grouping: 'std' },
  SGD: { code: 'SGD', symbol: 'S$', decimals: 2, grouping: 'std' },
  HKD: { code: 'HKD', symbol: 'HK$', decimals: 2, grouping: 'std' },
  NZD: { code: 'NZD', symbol: 'NZ$', decimals: 2, grouping: 'std' },
  AED: { code: 'AED', symbol: 'د.إ', decimals: 2, grouping: 'std' },
  SAR: { code: 'SAR', symbol: '﷼', decimals: 2, grouping: 'std' },
  ZAR: { code: 'ZAR', symbol: 'R', decimals: 2, grouping: 'std' },
  BRL: { code: 'BRL', symbol: 'R$', decimals: 2, grouping: 'std' },
  MXN: { code: 'MXN', symbol: 'MX$', decimals: 2, grouping: 'std' },
  RUB: { code: 'RUB', symbol: '₽', decimals: 2, grouping: 'std' },
  KRW: { code: 'KRW', symbol: '₩', decimals: 0, grouping: 'std' },
  IDR: { code: 'IDR', symbol: 'Rp', decimals: 2, grouping: 'std' },
  MYR: { code: 'MYR', symbol: 'RM', decimals: 2, grouping: 'std' },
  THB: { code: 'THB', symbol: '฿', decimals: 2, grouping: 'std' },
  PHP: { code: 'PHP', symbol: '₱', decimals: 2, grouping: 'std' },
  VND: { code: 'VND', symbol: '₫', decimals: 0, grouping: 'std' },
  PKR: { code: 'PKR', symbol: '₨', decimals: 2, grouping: 'in' },
  BDT: { code: 'BDT', symbol: '৳', decimals: 2, grouping: 'in' },
  LKR: { code: 'LKR', symbol: 'Rs', decimals: 2, grouping: 'in' },
  NPR: { code: 'NPR', symbol: 'रू', decimals: 2, grouping: 'in' },
  NGN: { code: 'NGN', symbol: '₦', decimals: 2, grouping: 'std' },
  KES: { code: 'KES', symbol: 'KSh', decimals: 2, grouping: 'std' },
  EGP: { code: 'EGP', symbol: 'E£', decimals: 2, grouping: 'std' },
  TRY: { code: 'TRY', symbol: '₺', decimals: 2, grouping: 'std' },
  SEK: { code: 'SEK', symbol: 'kr', decimals: 2, grouping: 'std' },
  NOK: { code: 'NOK', symbol: 'kr', decimals: 2, grouping: 'std' },
  DKK: { code: 'DKK', symbol: 'kr', decimals: 2, grouping: 'std' },
  PLN: { code: 'PLN', symbol: 'zł', decimals: 2, grouping: 'std' },
};

// Country → currency. Kept alphabetical by name for the picker.
export const COUNTRIES: CountryInfo[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'NPR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB' },
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: 'TRY' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND' },
];

const FALLBACK: CurrencyInfo = { code: 'USD', symbol: '$', decimals: 2, grouping: 'std' };

export function getCurrency(code: string | undefined | null): CurrencyInfo {
  if (!code) return FALLBACK;
  return CURRENCIES[code] ?? FALLBACK;
}

export function getCountry(code: string | undefined | null): CountryInfo | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code);
}

/** Best-effort: pick a representative country for a currency (for legacy data). */
export function countryForCurrency(currency: string): CountryInfo | undefined {
  return COUNTRIES.find((c) => c.currency === currency);
}
