import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatMoney } from './currency';

dayjs.extend(relativeTime);

/** Formats an amount in the user's active currency (see src/utils/currency.ts). */
export function formatCurrency(amount: number, compact = false): string {
  return formatMoney(amount, compact);
}

export function formatDate(iso: string, format = 'DD MMM YYYY'): string {
  return dayjs(iso).format(format);
}

export function formatTime(iso: string): string {
  return dayjs(iso).format('hh:mm A');
}

export function formatDateGroup(iso: string): string {
  const d = dayjs(iso);
  const today = dayjs();
  if (d.isSame(today, 'day')) return 'Today';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('DD MMM YYYY');
}

export function formatRelativeTime(iso: string): string {
  return dayjs(iso).fromNow();
}

export function formatMonth(month: string): string {
  return dayjs(month).format('MMM YYYY');
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function groupTransactionsByDate<T extends { transaction_timestamp: string }>(
  transactions: T[]
): { date: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();

  for (const tx of transactions) {
    const key = dayjs(tx.transaction_timestamp).format('YYYY-MM-DD');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([date, items]) => ({
      date,
      label: formatDateGroup(date),
      items,
    }));
}
