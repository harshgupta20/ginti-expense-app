import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import { setActiveCurrency } from '../utils/currency';
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  getCountry,
  countryForCurrency,
} from '../constants/currencies';

const SETTINGS_FILE = `${FileSystem.documentDirectory}tracker_settings.json`;

interface Settings {
  onboardingComplete: boolean;
  notificationPermissionGranted: boolean;
  theme: 'dark' | 'light' | 'system';
  // ISO country code + ISO 4217 currency code driving all money display.
  country: string;
  currency: string;
  defaultCurrency: string; // legacy field, kept in sync for older backups
  // Local reminder notifications (no server — scheduled on-device).
  remindersEnabled: boolean;
  reminderHours: { morning: number; afternoon: number; recap: number };
}

interface SettingsStore {
  settings: Settings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  setCountry: (countryCode: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setNotificationPermission: (granted: boolean) => void;
}

const DEFAULT_SETTINGS: Settings = {
  onboardingComplete: false,
  notificationPermissionGranted: false,
  theme: 'dark',
  country: DEFAULT_COUNTRY, // US
  currency: DEFAULT_CURRENCY, // USD
  defaultCurrency: DEFAULT_CURRENCY,
  remindersEnabled: true,
  reminderHours: { morning: 9, afternoon: 14, recap: 22 },
};

async function readFromDisk(): Promise<Settings> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return DEFAULT_SETTINGS;
    const raw = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    const parsed = JSON.parse(raw);
    const merged: Settings = { ...DEFAULT_SETTINGS, ...parsed };
    // Migrate pre-i18n installs: they only had `defaultCurrency` (e.g. 'INR').
    // Preserve that currency so existing users keep their expected symbol.
    if (!parsed.currency && parsed.defaultCurrency) {
      merged.currency = parsed.defaultCurrency;
    }
    if (!parsed.country) {
      merged.country = countryForCurrency(merged.currency)?.code ?? DEFAULT_COUNTRY;
    }
    merged.defaultCurrency = merged.currency;
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeToDisk(settings: Settings): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to persist settings:', e);
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const settings = await readFromDisk();
      setActiveCurrency(settings.currency);
      set({ settings, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSetting: async (key, value) => {
    const updated = { ...get().settings, [key]: value };
    if (key === 'currency') setActiveCurrency(value as string);
    set({ settings: updated });
    await writeToDisk(updated);
  },

  setCountry: async (countryCode) => {
    const country = getCountry(countryCode);
    if (!country) return;
    const updated = {
      ...get().settings,
      country: country.code,
      currency: country.currency,
      defaultCurrency: country.currency,
    };
    setActiveCurrency(country.currency);
    set({ settings: updated });
    await writeToDisk(updated);
  },

  completeOnboarding: async () => {
    await get().updateSetting('onboardingComplete', true);
  },

  setNotificationPermission: (granted) => {
    get().updateSetting('notificationPermissionGranted', granted);
  },
}));
