import { create } from 'zustand';
import { CategoryConfig, PaymentSource, Member, MemberRelation } from '../types';
import {
  getAllCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  getAllPaymentSources,
  insertPaymentSource,
  updatePaymentSource,
  deletePaymentSource,
  getAllMembers,
  insertMember,
  updateMember,
  deleteMember,
} from '../db/database';
import { Colors } from '../constants/colors';

interface ConfigStore {
  categories: CategoryConfig[];
  paymentSources: PaymentSource[];
  members: Member[];
  isLoaded: boolean;

  load: () => Promise<void>;

  // Categories
  addCategory: (name: string, color: string, icon: string) => Promise<void>;
  editCategory: (id: number, updates: Partial<Pick<CategoryConfig, 'name' | 'color' | 'icon'>>) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;

  // Payment sources
  addPaymentSource: (name: string, icon: string) => Promise<void>;
  editPaymentSource: (id: number, updates: Partial<Pick<PaymentSource, 'name' | 'icon'>>) => Promise<void>;
  removePaymentSource: (id: number) => Promise<void>;

  // Members
  addMember: (name: string, relation: MemberRelation) => Promise<void>;
  editMember: (id: number, updates: Partial<Pick<Member, 'name' | 'relation'>>) => Promise<void>;
  removeMember: (id: number) => Promise<void>;

  // Lookups
  colorFor: (category: string) => string;
  iconFor: (category: string) => string;
  memberName: (id: number | null | undefined) => string | null;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  categories: [],
  paymentSources: [],
  members: [],
  isLoaded: false,

  load: async () => {
    try {
      const [categories, paymentSources, members] = await Promise.all([
        getAllCategories(),
        getAllPaymentSources(),
        getAllMembers(),
      ]);
      set({ categories, paymentSources, members, isLoaded: true });
    } catch (e) {
      console.error('configStore load error:', e);
      set({ isLoaded: true });
    }
  },

  addCategory: async (name, color, icon) => {
    await insertCategory(name, color, icon);
    set({ categories: await getAllCategories() });
  },
  editCategory: async (id, updates) => {
    await updateCategory(id, updates);
    set({ categories: await getAllCategories() });
  },
  removeCategory: async (id) => {
    await deleteCategory(id);
    set({ categories: await getAllCategories() });
  },

  addPaymentSource: async (name, icon) => {
    await insertPaymentSource(name, icon);
    set({ paymentSources: await getAllPaymentSources() });
  },
  editPaymentSource: async (id, updates) => {
    await updatePaymentSource(id, updates);
    set({ paymentSources: await getAllPaymentSources() });
  },
  removePaymentSource: async (id) => {
    await deletePaymentSource(id);
    set({ paymentSources: await getAllPaymentSources() });
  },

  addMember: async (name, relation) => {
    await insertMember(name, relation);
    set({ members: await getAllMembers() });
  },
  editMember: async (id, updates) => {
    await updateMember(id, updates);
    set({ members: await getAllMembers() });
  },
  removeMember: async (id) => {
    await deleteMember(id);
    set({ members: await getAllMembers() });
  },

  colorFor: (category) => {
    const match = get().categories.find((c) => c.name === category);
    return match?.color ?? Colors.categoryColors[category] ?? Colors.textSecondary;
  },
  iconFor: (category) => {
    const match = get().categories.find((c) => c.name === category);
    return match?.icon ?? 'ellipsis-horizontal-circle';
  },
  memberName: (id) => {
    if (id == null) return null;
    return get().members.find((m) => m.id === id)?.name ?? null;
  },
}));
