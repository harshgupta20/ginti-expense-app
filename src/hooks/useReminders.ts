import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useBudgetStore } from '../stores/budgetStore';
import { rescheduleReminders } from '../services/notifications';
import { checkBudgetAlerts } from '../services/budgetAlerts';
import { processDueSubscriptions } from '../services/subscriptions';

/**
 * Keeps on-device reminders in sync. Re-queues the rolling notification window on
 * launch and whenever the app is foregrounded (so the daily-spend recap reflects
 * the latest data), and refreshes dashboard/budget state. No server, no background task.
 */
export function useReminders() {
  const { remindersEnabled, reminderHours } = useSettingsStore((s) => s.settings);
  const fetchDashboard = useTransactionStore((s) => s.fetchDashboardData);
  const fetchBudgetProgress = useBudgetStore((s) => s.fetchBudgetProgress);

  useEffect(() => {
    // Generate any due subscription charges, then refresh views and (re)schedule reminders.
    const run = async () => {
      try {
        const created = await processDueSubscriptions();
        if (created > 0) {
          await Promise.all([fetchDashboard(), fetchBudgetProgress()]);
        }
      } catch (e) {
        console.warn('[subscriptions] processing failed', e);
      }
      rescheduleReminders(remindersEnabled, reminderHours).catch((e) =>
        console.warn('[reminders] reschedule failed', e)
      );
      checkBudgetAlerts().catch(() => {});
    };

    run();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        run();
        fetchDashboard();
        fetchBudgetProgress();
      }
    });

    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindersEnabled, reminderHours.morning, reminderHours.afternoon, reminderHours.recap]);
}
