import dayjs from 'dayjs';
import { Subscription } from '../types';
import {
  getActiveSubscriptions,
  getSubscriptionChargedMonths,
  insertTransaction,
} from '../db/database';

/** Amount charged per month. Yearly subscriptions are amortised across 12 months. */
export function monthlyCharge(sub: Pick<Subscription, 'amount' | 'billing_cycle'>): number {
  return sub.billing_cycle === 'yearly' ? sub.amount / 12 : sub.amount;
}

/**
 * Generates any missing monthly charges for active subscriptions, from each
 * subscription's start month up to the current month. Idempotent — a month that
 * already has a charge is skipped. Runs fully on-device on app open.
 * Returns the number of transactions created.
 */
export async function processDueSubscriptions(): Promise<number> {
  const subs = await getActiveSubscriptions();
  const now = dayjs();
  const currentMonth = now.format('YYYY-MM');
  let created = 0;

  for (const sub of subs) {
    const charged = await getSubscriptionChargedMonths(sub.id);
    let cursor = dayjs(`${sub.start_month}-01`);
    const end = dayjs(`${currentMonth}-01`);
    if (!cursor.isValid()) continue;

    while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
      const m = cursor.format('YYYY-MM');
      if (!charged.has(m)) {
        const isCurrent = m === currentMonth;
        const day = Math.min(sub.day_of_month, cursor.daysInMonth());
        // For the current month, only charge once the billing day has arrived.
        if (!isCurrent || now.date() >= day) {
          const ts = cursor.date(day).hour(12).minute(0).second(0).millisecond(0).toISOString();
          await insertTransaction({
            amount: monthlyCharge(sub),
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
            note: `${sub.name} · ${sub.billing_cycle === 'yearly' ? 'yearly (billed monthly)' : 'monthly'} subscription`,
            subscription_id: sub.id,
          });
          created++;
        }
      }
      cursor = cursor.add(1, 'month');
    }
  }
  return created;
}
