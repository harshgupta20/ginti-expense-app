import dayjs from 'dayjs';
import { Subscription } from '../types';
import {
  getActiveSubscriptions,
  getSubscriptionChargedMonths,
  getSubscriptionChargedDates,
  insertTransaction,
} from '../db/database';

const DAYS_PER_MONTH = 30.44;
const WEEKS_PER_MONTH = 52 / 12;
// Safety cap so a daily/weekly subscription with a very old anchor can never
// generate an unbounded number of rows in a single pass.
const MAX_OCCURRENCES_PER_RUN = 1000;

/**
 * Approximate amount charged per month — used only for summaries/estimates.
 * Monthly is the amount as entered; yearly is amortised across 12 months;
 * daily/weekly are scaled up to a monthly figure.
 */
export function monthlyCharge(sub: Pick<Subscription, 'amount' | 'billing_cycle'>): number {
  switch (sub.billing_cycle) {
    case 'daily':
      return sub.amount * DAYS_PER_MONTH;
    case 'weekly':
      return sub.amount * WEEKS_PER_MONTH;
    case 'yearly':
      return sub.amount / 12;
    default:
      return sub.amount;
  }
}

async function insertSubCharge(sub: Subscription, ts: string, amount: number): Promise<void> {
  const cycleLabel =
    sub.billing_cycle === 'daily'
      ? 'daily'
      : sub.billing_cycle === 'weekly'
        ? 'weekly'
        : sub.billing_cycle === 'yearly'
          ? 'yearly (billed monthly)'
          : 'monthly';
  await insertTransaction({
    amount,
    merchant_name: sub.name,
    normalized_merchant_name: sub.name,
    category: sub.category,
    source_app: sub.payment_source ?? 'Subscription',
    transaction_type: 'expense',
    confidence_score: 1,
    raw_notification_id: null,
    transaction_timestamp: ts,
    needs_review: 0,
    payment_source: sub.payment_source,
    paid_by_member_id: sub.paid_by_member_id,
    note: `${sub.name} · ${cycleLabel} subscription`,
    subscription_id: sub.id,
  });
}

/**
 * Monthly & yearly: backfill one charge per month from the subscription's
 * start month up to the current month. Yearly is amortised (÷12) per month.
 * Idempotent — a month that already has a charge is skipped.
 */
async function processMonthlySub(sub: Subscription, now: dayjs.Dayjs): Promise<number> {
  const currentMonth = now.format('YYYY-MM');
  const charged = await getSubscriptionChargedMonths(sub.id);
  let cursor = dayjs(`${sub.start_month}-01`);
  const end = dayjs(`${currentMonth}-01`);
  if (!cursor.isValid()) return 0;

  let created = 0;
  while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
    const m = cursor.format('YYYY-MM');
    if (!charged.has(m)) {
      const isCurrent = m === currentMonth;
      const day = Math.min(sub.day_of_month, cursor.daysInMonth());
      // For the current month, only charge once the billing day has arrived.
      if (!isCurrent || now.date() >= day) {
        const ts = cursor.date(day).hour(12).minute(0).second(0).millisecond(0).toISOString();
        await insertSubCharge(sub, ts, monthlyCharge(sub));
        created++;
      }
    }
    cursor = cursor.add(1, 'month');
  }
  return created;
}

/**
 * Daily & weekly: generate one charge per occurrence, FORWARD-ONLY from the
 * subscription's creation date (no historical backfill — that would flood
 * history for a long-running daily subscription). De-duplicated by local date.
 */
async function processHighFrequencySub(sub: Subscription, now: dayjs.Dayjs): Promise<number> {
  const charged = await getSubscriptionChargedDates(sub.id);
  const stepDays = sub.billing_cycle === 'weekly' ? 7 : 1;
  let cursor = dayjs(sub.created_at).startOf('day');
  if (!cursor.isValid()) return 0;
  const today = now.startOf('day');

  let created = 0;
  let guard = 0;
  while ((cursor.isBefore(today) || cursor.isSame(today, 'day')) && guard < MAX_OCCURRENCES_PER_RUN) {
    guard++;
    const key = cursor.format('YYYY-MM-DD');
    if (!charged.has(key)) {
      const ts = cursor.hour(12).minute(0).second(0).millisecond(0).toISOString();
      await insertSubCharge(sub, ts, sub.amount);
      created++;
    }
    cursor = cursor.add(stepDays, 'day');
  }
  return created;
}

/**
 * Generates any missing charges for active subscriptions. Runs fully on-device
 * on app open. Idempotent. Returns the number of transactions created.
 */
export async function processDueSubscriptions(): Promise<number> {
  const subs = await getActiveSubscriptions();
  const now = dayjs();
  let created = 0;

  for (const sub of subs) {
    if (sub.billing_cycle === 'daily' || sub.billing_cycle === 'weekly') {
      created += await processHighFrequencySub(sub, now);
    } else {
      created += await processMonthlySub(sub, now);
    }
  }
  return created;
}
