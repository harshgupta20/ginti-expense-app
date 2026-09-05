import dayjs from 'dayjs';

export function startOfDay(date?: string | Date): string {
  return dayjs(date).startOf('day').toISOString();
}

export function endOfDay(date?: string | Date): string {
  return dayjs(date).endOf('day').toISOString();
}

export function startOfMonth(date?: string | Date): string {
  return dayjs(date).startOf('month').toISOString();
}

export function endOfMonth(date?: string | Date): string {
  return dayjs(date).endOf('month').toISOString();
}

export function startOfWeek(date?: string | Date): string {
  return dayjs(date).startOf('week').toISOString();
}

export function todayISO(): string {
  return dayjs().toISOString();
}

export function getLast7Days(): { start: string; end: string } {
  return {
    start: dayjs().subtract(6, 'day').startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  };
}

export function getLast30Days(): { start: string; end: string } {
  return {
    start: dayjs().subtract(29, 'day').startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  };
}

export function getCurrentMonth(): { start: string; end: string } {
  return {
    start: dayjs().startOf('month').toISOString(),
    end: dayjs().endOf('month').toISOString(),
  };
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const d = dayjs().year(year).month(month);
  return {
    start: d.startOf('month').toISOString(),
    end: d.endOf('month').toISOString(),
  };
}

export function calendarDateToISO(dateString: string): string {
  return dayjs(dateString).toISOString();
}
