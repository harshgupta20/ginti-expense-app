import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { getSpendByDateRange } from '../db/database';
import { MOTIVATIONAL_MESSAGES, NudgeMessage } from '../constants/motivationalMessages';
import { formatCurrency } from '../utils/formatters';

// How a notification behaves when it fires while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = 'reminders';
// How many days ahead we keep notifications queued. Re-topped-up on every app open,
// so this only needs to cover stretches where the app isn't opened. iOS caps pending
// notifications at 64; 14 days × 3/day + monthly = ~43, safely under the limit.
const WINDOW_DAYS = 14;

export interface ReminderHours {
  morning: number;
  afternoon: number;
  recap: number;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    lightColor: '#6C63FF',
  });
}

/** Shuffled queue of nudges so each scheduled notification differs from the last. */
function makeNudgeQueue(): () => NudgeMessage {
  let pool: NudgeMessage[] = [];
  const reshuffle = () => {
    pool = [...MOTIVATIONAL_MESSAGES];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  };
  reshuffle();
  return () => {
    if (pool.length === 0) reshuffle();
    return pool.pop()!;
  };
}

function recapContent(spent: number, isToday: boolean): { title: string; body: string } {
  if (isToday) {
    return spent > 0
      ? { title: '🌙 today\'s damage', body: `You logged ${formatCurrency(spent)} today. Anything missing? Add it before bed.` }
      : { title: '🌙 no spends logged today', body: 'A ₹0 day or did something slip? Tap to log it real quick.' };
  }
  return {
    title: '🌙 day\'s a wrap',
    body: 'Open Ginti to see today\'s total and log anything you missed.',
  };
}

async function scheduleAt(
  date: Date,
  content: { title: string; body: string },
  data: Record<string, unknown>
): Promise<void> {
  if (date.getTime() <= Date.now()) return; // never schedule in the past
  await Notifications.scheduleNotificationAsync({
    content: { title: content.title, body: content.body, data },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

/**
 * Cancels all previously-scheduled reminders and re-queues a rolling window.
 * Fully on-device — call this on app launch and whenever the app is foregrounded.
 * Returns false if reminders are disabled or permission is missing.
 */
export async function rescheduleReminders(
  enabled: boolean,
  hours: ReminderHours
): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return false;

  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  await ensureAndroidChannel();

  const nextNudge = makeNudgeQueue();
  const todayStr = dayjs().format('YYYY-MM-DD');

  for (let offset = 0; offset < WINDOW_DAYS; offset++) {
    const day = dayjs().add(offset, 'day');

    // Two motivational nudges per day.
    for (const hour of [hours.morning, hours.afternoon]) {
      const at = day.hour(hour).minute(0).second(0).millisecond(0).toDate();
      const msg = nextNudge();
      await scheduleAt(at, msg, { kind: 'motivation' });
    }

    // One spend recap per day. Only "today" can carry a real figure (computed now);
    // future days use generic copy and refresh next time the app opens.
    const recapAt = day.hour(hours.recap).minute(0).second(0).millisecond(0).toDate();
    const isToday = day.format('YYYY-MM-DD') === todayStr;
    let spent = 0;
    if (isToday) {
      spent = await getSpendByDateRange(
        day.startOf('day').toISOString(),
        day.endOf('day').toISOString()
      );
    }
    await scheduleAt(recapAt, recapContent(spent, isToday), { kind: 'daily_recap' });
  }

  // End-of-month summary on the last day of the current month.
  const endOfMonth = dayjs().endOf('month');
  const monthSpent = await getSpendByDateRange(
    dayjs().startOf('month').toISOString(),
    endOfMonth.toISOString()
  );
  const monthlyAt = endOfMonth.hour(hours.recap).minute(30).second(0).millisecond(0).toDate();
  await scheduleAt(
    monthlyAt,
    {
      title: `📊 ${dayjs().format('MMMM')} wrapped`,
      body:
        monthSpent > 0
          ? `You spent ${formatCurrency(monthSpent)} this month. Tap to see the breakdown 👀`
          : 'New month, fresh start. Open Ginti and start logging 💸',
    },
    { kind: 'monthly_summary' }
  );

  return true;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
