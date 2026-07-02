import { SubscriptionDetection } from '../types';
import { getAllTransactionsForMerchant, getUniqueMerchants } from '../db/database';
import dayjs from 'dayjs';

const MIN_TRANSACTIONS_FOR_SUBSCRIPTION = 2;
const MONTHLY_DAY_TOLERANCE = 5; // days variance allowed for monthly pattern

function detectMonthlyPattern(dates: string[]): boolean {
  if (dates.length < MIN_TRANSACTIONS_FOR_SUBSCRIPTION) return false;

  const sorted = dates.map((d) => dayjs(d)).sort((a, b) => a.diff(b));

  let monthlyMatches = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].diff(sorted[i - 1], 'day');
    if (diff >= 28 - MONTHLY_DAY_TOLERANCE && diff <= 31 + MONTHLY_DAY_TOLERANCE) {
      monthlyMatches++;
    }
  }

  return monthlyMatches >= sorted.length - 1;
}

function detectYearlyPattern(dates: string[]): boolean {
  if (dates.length < 2) return false;

  const sorted = dates.map((d) => dayjs(d)).sort((a, b) => a.diff(b));

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].diff(sorted[i - 1], 'day');
    if (diff >= 350 && diff <= 380) return true;
  }
  return false;
}

export async function detectSubscriptions(): Promise<SubscriptionDetection[]> {
  const merchants = await getUniqueMerchants();
  const subscriptions: SubscriptionDetection[] = [];

  for (const merchant of merchants) {
    const txs = await getAllTransactionsForMerchant(merchant);
    if (txs.length < MIN_TRANSACTIONS_FOR_SUBSCRIPTION) continue;

    const dates = txs.map((t) => t.transaction_timestamp);
    const amounts = txs.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Check amount consistency (within 10% variance)
    const amountVariance = amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount <= 0.1
    );
    if (!amountVariance) continue;

    if (detectMonthlyPattern(dates)) {
      const lastDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const nextDate = dayjs(lastDate).add(1, 'month').format('YYYY-MM-DD');
      subscriptions.push({
        merchant,
        amount: avgAmount,
        frequency: 'monthly',
        lastDate,
        nextExpectedDate: nextDate,
        transactionCount: txs.length,
      });
    } else if (detectYearlyPattern(dates)) {
      const lastDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const nextDate = dayjs(lastDate).add(1, 'year').format('YYYY-MM-DD');
      subscriptions.push({
        merchant,
        amount: avgAmount,
        frequency: 'yearly',
        lastDate,
        nextExpectedDate: nextDate,
        transactionCount: txs.length,
      });
    }
  }

  return subscriptions;
}
