import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { getEffectiveBudgets, getCategoryBreakdown } from '../db/database';
import { formatCurrency } from '../utils/formatters';

// Note: the global notification handler is registered once in services/notifications.ts.

const ALERT_THRESHOLDS = [80, 90, 100];

// Track which thresholds were already alerted this month (keyed by category+month+threshold)
const alertedKeys = new Set<string>();

export async function checkBudgetAlerts(): Promise<void> {
  const now = dayjs();
  const month = now.format('YYYY-MM');
  const budgets = await getEffectiveBudgets(month);
  if (budgets.length === 0) return;

  const startOfMonth = now.startOf('month').toISOString();
  const endOfMonth = now.endOf('month').toISOString();

  const breakdown = await getCategoryBreakdown(startOfMonth, endOfMonth);
  const spendMap = new Map(breakdown.map((b) => [b.category, b.amount]));
  const totalSpent = breakdown.reduce((a, b) => a + b.amount, 0);

  for (const budget of budgets) {
    const isOverall = budget.category === null;
    const label = isOverall ? 'overall' : budget.category!;
    const spent = isOverall ? totalSpent : spendMap.get(budget.category!) ?? 0;
    const percentage = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;

    for (const threshold of ALERT_THRESHOLDS) {
      const key = `${label}_${month}_${threshold}`;
      if (percentage >= threshold && !alertedKeys.has(key)) {
        alertedKeys.add(key);
        await sendBudgetAlert(label, spent, budget.limit_amount, threshold);
      }
    }
  }
}

async function sendBudgetAlert(
  category: string,
  spent: number,
  limit: number,
  threshold: number
): Promise<void> {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) return;
  }

  const pct = Math.round((spent / limit) * 100);
  const message =
    threshold >= 100
      ? `You've exceeded your ${category} budget (${formatCurrency(spent)} / ${formatCurrency(limit)})`
      : `You've used ${pct}% of your ${category} budget (${formatCurrency(spent)} / ${formatCurrency(limit)})`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Budget Alert: ${category}`,
      body: message,
      data: { category, spent, limit, threshold },
    },
    trigger: null,
  });
}
