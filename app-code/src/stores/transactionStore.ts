import { create } from 'zustand';
import {
  Transaction,
  TransactionFilters,
  Category,
  DashboardStats,
  CategoryBreakdown,
  WeeklyData,
  MonthlyData,
  PaymentSourceStat,
  WeekdaySpend,
  PeriodTotals,
} from '../types';
import {
  getTransactions,
  getTransactionsNeedingReview,
  getRecentTransactions,
  getSpendByDateRange,
  getCategoryBreakdown,
  getDailySpend,
  getMonthlySpend,
  getTypeTotals,
  getBiggestExpense,
  getPaymentSourceBreakdown,
  getWeekdaySpend,
  updateTransaction,
  deleteTransaction,
  insertParserFeedback,
} from '../db/database';
import dayjs from 'dayjs';

interface TransactionStore {
  transactions: Transaction[];
  reviewQueue: Transaction[];
  recentTransactions: Transaction[];
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  filters: TransactionFilters;

  dashboardStats: DashboardStats;
  categoryBreakdown: CategoryBreakdown[];
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
  periodTotals: PeriodTotals;
  paymentSourceStats: PaymentSourceStat[];
  weekdaySpend: WeekdaySpend[];
  prevPeriodExpense: number;

  fetchTransactions: (reset?: boolean) => Promise<void>;
  fetchReviewQueue: () => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  fetchAnalyticsData: (startDate: string, endDate: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  approveTransaction: (id: number) => Promise<void>;
  correctTransaction: (
    id: number,
    rawNotifId: number | null,
    corrections: { merchant?: string; category?: Category; amount?: number }
  ) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  addToStore: (transaction: Transaction) => void;
}

const DEFAULT_STATS: DashboardStats = {
  todaySpend: 0,
  weekSpend: 0,
  monthSpend: 0,
  avgDailySpend: 0,
  topCategory: null,
};

const DEFAULT_PERIOD_TOTALS: PeriodTotals = {
  expense: 0,
  income: 0,
  transfer: 0,
  count: 0,
  avgExpense: 0,
  biggestExpense: null,
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  reviewQueue: [],
  recentTransactions: [],
  totalCount: 0,
  currentPage: 0,
  hasMore: true,
  isLoading: false,
  filters: {},
  dashboardStats: DEFAULT_STATS,
  categoryBreakdown: [],
  weeklyData: [],
  monthlyData: [],
  periodTotals: DEFAULT_PERIOD_TOTALS,
  paymentSourceStats: [],
  weekdaySpend: [],
  prevPeriodExpense: 0,

  fetchTransactions: async (reset = false) => {
    const { filters, currentPage, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const page = reset ? 0 : currentPage;
      const PAGE_SIZE = 30;
      const { data, total } = await getTransactions(filters, page, PAGE_SIZE);

      set((s) => ({
        transactions: reset ? data : [...s.transactions, ...data],
        totalCount: total,
        currentPage: page + 1,
        hasMore: (page + 1) * PAGE_SIZE < total,
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false });
      console.error('fetchTransactions error:', e);
    }
  },

  fetchReviewQueue: async () => {
    try {
      const queue = await getTransactionsNeedingReview();
      set({ reviewQueue: queue });
    } catch (e) {
      console.error('fetchReviewQueue error:', e);
    }
  },

  fetchRecentTransactions: async () => {
    try {
      const recent = await getRecentTransactions(10);
      set({ recentTransactions: recent });
    } catch (e) {
      console.error('fetchRecentTransactions error:', e);
    }
  },

  fetchDashboardData: async () => {
    try {
      const now = dayjs();
      const todayStart = now.startOf('day').toISOString();
      const todayEnd = now.endOf('day').toISOString();
      const weekStart = now.startOf('week').toISOString();
      const monthStart = now.startOf('month').toISOString();
      const monthEnd = now.endOf('month').toISOString();

      const [todaySpend, weekSpend, monthSpend, breakdown] = await Promise.all([
        getSpendByDateRange(todayStart, todayEnd),
        getSpendByDateRange(weekStart, todayEnd),
        getSpendByDateRange(monthStart, monthEnd),
        getCategoryBreakdown(monthStart, monthEnd),
      ]);

      const daysInMonth = now.date();
      const avgDailySpend = daysInMonth > 0 ? monthSpend / daysInMonth : 0;

      set({
        dashboardStats: {
          todaySpend,
          weekSpend,
          monthSpend,
          avgDailySpend,
          topCategory: breakdown[0]?.category ?? null,
        },
      });
    } catch (e) {
      console.error('fetchDashboardData error:', e);
    }
  },

  fetchAnalyticsData: async (startDate: string, endDate: string) => {
    try {
      // Previous period of equal length, for the period-over-period comparison.
      const spanMs = dayjs(endDate).diff(dayjs(startDate));
      const prevStart = dayjs(startDate).subtract(spanMs, 'millisecond').toISOString();
      const prevEnd = startDate;

      const [breakdown, daily, monthly, typeTotals, biggest, sources, weekday, prevExpense] =
        await Promise.all([
          getCategoryBreakdown(startDate, endDate),
          getDailySpend(startDate, endDate),
          getMonthlySpend(),
          getTypeTotals(startDate, endDate),
          getBiggestExpense(startDate, endDate),
          getPaymentSourceBreakdown(startDate, endDate),
          getWeekdaySpend(startDate, endDate),
          getSpendByDateRange(prevStart, prevEnd),
        ]);

      const totalSpend = breakdown.reduce((acc, b) => acc + b.amount, 0);
      const findType = (t: string) => typeTotals.find((x) => x.transaction_type === t);
      const expenseRow = findType('expense');
      const expense = expenseRow?.total ?? 0;
      const count = expenseRow?.count ?? 0;

      set({
        categoryBreakdown: breakdown.map((b) => ({
          ...b,
          percentage: totalSpend > 0 ? (b.amount / totalSpend) * 100 : 0,
        })),
        weeklyData: daily.map((d) => ({
          date: d.date,
          amount: d.amount,
          label: dayjs(d.date).format('DD'),
        })),
        monthlyData: monthly,
        periodTotals: {
          expense,
          income: findType('income')?.total ?? 0,
          transfer: findType('transfer')?.total ?? 0,
          count,
          avgExpense: count > 0 ? expense / count : 0,
          biggestExpense: biggest,
        },
        paymentSourceStats: sources.map((s) => ({ source: s.source, amount: s.amount, count: s.count })),
        weekdaySpend: weekday,
        prevPeriodExpense: prevExpense,
      });
    } catch (e) {
      console.error('fetchAnalyticsData error:', e);
    }
  },

  setFilters: (filters) => {
    set({ filters, currentPage: 0, transactions: [], hasMore: true });
    get().fetchTransactions(true);
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 0, transactions: [], hasMore: true });
    get().fetchTransactions(true);
  },

  approveTransaction: async (id) => {
    await updateTransaction(id, { needs_review: 0 });
    set((s) => ({
      reviewQueue: s.reviewQueue.filter((t) => t.id !== id),
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, needs_review: 0 } : t
      ),
    }));
  },

  correctTransaction: async (id, rawNotifId, corrections) => {
    const updates: Parameters<typeof updateTransaction>[1] = { needs_review: 0 };
    if (corrections.merchant !== undefined) {
      updates.merchant_name = corrections.merchant;
      updates.normalized_merchant_name = corrections.merchant;
    }
    if (corrections.category !== undefined) updates.category = corrections.category;
    if (corrections.amount !== undefined) updates.amount = corrections.amount;

    await updateTransaction(id, updates);
    await insertParserFeedback(
      rawNotifId,
      id,
      corrections.merchant ?? null,
      corrections.category ?? null,
      corrections.amount ?? null
    );

    set((s) => ({
      reviewQueue: s.reviewQueue.filter((t) => t.id !== id),
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  removeTransaction: async (id) => {
    await deleteTransaction(id);
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
      reviewQueue: s.reviewQueue.filter((t) => t.id !== id),
      recentTransactions: s.recentTransactions.filter((t) => t.id !== id),
    }));
  },

  addToStore: (transaction) => {
    set((s) => ({
      recentTransactions: [transaction, ...s.recentTransactions].slice(0, 10),
    }));
  },
}));
