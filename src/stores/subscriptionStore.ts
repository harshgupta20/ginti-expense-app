import { create } from 'zustand';
import { Subscription } from '../types';
import {
  getAllSubscriptions,
  insertSubscription,
  updateSubscription,
  deleteSubscription,
} from '../db/database';

interface SubscriptionStore {
  subscriptions: Subscription[];
  load: () => Promise<void>;
  add: (sub: Omit<Subscription, 'id' | 'created_at'>) => Promise<number>;
  edit: (id: number, updates: Partial<Subscription>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  toggleActive: (id: number, active: boolean) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],

  load: async () => {
    try {
      set({ subscriptions: await getAllSubscriptions() });
    } catch (e) {
      console.error('subscriptions load error:', e);
    }
  },

  add: async (sub) => {
    const id = await insertSubscription(sub);
    set({ subscriptions: await getAllSubscriptions() });
    return id;
  },

  edit: async (id, updates) => {
    await updateSubscription(id, updates);
    set({ subscriptions: await getAllSubscriptions() });
  },

  remove: async (id) => {
    await deleteSubscription(id);
    set({ subscriptions: await getAllSubscriptions() });
  },

  toggleActive: async (id, active) => {
    await updateSubscription(id, { active: active ? 1 : 0 });
    set({ subscriptions: await getAllSubscriptions() });
  },
}));
