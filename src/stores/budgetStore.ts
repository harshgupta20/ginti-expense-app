import { create } from 'zustand';
import { CategoryBudgetProgress, BudgetMonthSummary } from '../types';
import {
  getEffectiveBudgets,
  upsertBudgetPeriod,
  deleteBudgetPeriod,
  getBudgetPeriodsForMonth,
  getBudgetMonths,
  getCategoryBreakdown,
} from '../db/database';
import dayjs from 'dayjs';

export const OVERALL_KEY = '__overall__';

function monthRange(month: string): { start: string; end: string } {
  const m = dayjs(`${month}-01`);
  return { start: m.startOf('month').toISOString(), end: m.endOf('month').toISOString() };
}

interface BudgetStore {
  selectedMonth: string; // 'YYYY-MM'
  overall: CategoryBudgetProgress | null;
  categoryProgress: CategoryBudgetProgress[];
  history: BudgetMonthSummary[];
  isLoading: boolean;

  setMonth: (month: string) => Promise<void>;
  fetchBudgetProgress: () => Promise<void>;
  setBudget: (category: string | null, limit: number) => Promise<void>;
  clearBudget: (periodId: number) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  selectedMonth: dayjs().format('YYYY-MM'),
  overall: null,
  categoryProgress: [],
  history: [],
  isLoading: false,

  setMonth: async (month) => {
    set({ selectedMonth: month });
    await get().fetchBudgetProgress();
  },

  fetchBudgetProgress: async () => {
    set({ isLoading: true });
    try {
      const month = get().selectedMonth;
      const { start, end } = monthRange(month);
      const [effective, breakdown] = await Promise.all([
        getEffectiveBudgets(month),
        getCategoryBreakdown(start, end),
      ]);
      const spendMap = new Map(breakdown.map((b) => [b.category, b.amount]));
      const totalSpent = breakdown.reduce((a, b) => a + b.amount, 0);

      let overall: CategoryBudgetProgress | null = null;
      const categoryProgress: CategoryBudgetProgress[] = [];

      for (const row of effective) {
        if (row.category === null) {
          const remaining = Math.max(row.limit_amount - totalSpent, 0);
          overall = {
            category: OVERALL_KEY,
            limit: row.limit_amount,
            spent: totalSpent,
            remaining,
            percentage: row.limit_amount > 0 ? (totalSpent / row.limit_amount) * 100 : 0,
            carriedForward: row.carried,
            periodId: row.periodId,
          };
        } else {
          const spent = spendMap.get(row.category) ?? 0;
          const remaining = Math.max(row.limit_amount - spent, 0);
          categoryProgress.push({
            category: row.category,
            limit: row.limit_amount,
            spent,
            remaining,
            percentage: row.limit_amount > 0 ? (spent / row.limit_amount) * 100 : 0,
            carriedForward: row.carried,
            periodId: row.periodId,
          });
        }
      }

      categoryProgress.sort((a, b) => b.percentage - a.percentage);
      set({ overall, categoryProgress, isLoading: false });
    } catch (e) {
      console.error('fetchBudgetProgress error:', e);
      set({ isLoading: false });
    }
  },

  setBudget: async (category, limit) => {
    await upsertBudgetPeriod(get().selectedMonth, category, limit);
    await get().fetchBudgetProgress();
  },

  clearBudget: async (periodId) => {
    await deleteBudgetPeriod(periodId);
    await get().fetchBudgetProgress();
  },

  fetchHistory: async () => {
    try {
      const months = await getBudgetMonths();
      const summaries: BudgetMonthSummary[] = [];
      for (const month of months) {
        const { start, end } = monthRange(month);
        const [rows, breakdown] = await Promise.all([
          getBudgetPeriodsForMonth(month),
          getCategoryBreakdown(start, end),
        ]);
        const spent = breakdown.reduce((a, b) => a + b.amount, 0);
        const overallRow = rows.find((r) => r.category === null);
        const totalBudget = overallRow
          ? overallRow.limit_amount
          : rows.filter((r) => r.category !== null).reduce((a, r) => a + r.limit_amount, 0);
        summaries.push({ month, totalBudget, spent });
      }
      set({ history: summaries });
    } catch (e) {
      console.error('fetchHistory error:', e);
    }
  },
}));
