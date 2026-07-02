import { create } from 'zustand';
import { MerchantAlias, MerchantStat } from '../types';
import { getAllMerchantAliases, upsertMerchantAlias, deleteMerchantAlias, getTopMerchants, getMerchantStats } from '../db/database';
import { invalidateMerchantCache } from '../services/merchantAlias';
import dayjs from 'dayjs';

interface MerchantStore {
  aliases: MerchantAlias[];
  topMerchants: MerchantStat[];
  isLoading: boolean;

  fetchAliases: () => Promise<void>;
  fetchTopMerchants: () => Promise<void>;
  addAlias: (original: string, normalized: string) => Promise<void>;
  removeAlias: (id: number) => Promise<void>;
  getMerchantDetail: (merchant: string) => Promise<MerchantStat | null>;
}

export const useMerchantStore = create<MerchantStore>((set) => ({
  aliases: [],
  topMerchants: [],
  isLoading: false,

  fetchAliases: async () => {
    set({ isLoading: true });
    try {
      const aliases = await getAllMerchantAliases();
      set({ aliases, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      console.error('fetchAliases error:', e);
    }
  },

  fetchTopMerchants: async () => {
    try {
      const now = dayjs();
      const start = now.subtract(6, 'month').startOf('month').toISOString();
      const end = now.endOf('month').toISOString();
      const data = await getTopMerchants(start, end, 20);
      const stats: MerchantStat[] = data.map((d) => ({
        merchant: d.merchant,
        totalSpend: d.total,
        transactionCount: d.count,
        avgSpend: d.total / d.count,
        lastDate: d.last_date,
      }));
      set({ topMerchants: stats });
    } catch (e) {
      console.error('fetchTopMerchants error:', e);
    }
  },

  addAlias: async (original, normalized) => {
    await upsertMerchantAlias(original, normalized);
    invalidateMerchantCache();
    const aliases = await getAllMerchantAliases();
    set({ aliases });
  },

  removeAlias: async (id) => {
    await deleteMerchantAlias(id);
    invalidateMerchantCache();
    set((s) => ({ aliases: s.aliases.filter((a) => a.id !== id) }));
  },

  getMerchantDetail: async (merchant) => {
    const stats = await getMerchantStats(merchant);
    if (!stats) return null;
    return {
      merchant,
      totalSpend: stats.total ?? 0,
      transactionCount: stats.count ?? 0,
      avgSpend: stats.avg ?? 0,
      lastDate: stats.last_date ?? '',
    };
  },
}));
