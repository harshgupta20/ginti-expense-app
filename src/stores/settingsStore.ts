import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';

const SETTINGS_FILE = `${FileSystem.documentDirectory}tracker_settings.json`;

interface Settings {
  onboardingComplete: boolean;
  notificationPermissionGranted: boolean;
  theme: 'dark' | 'light' | 'system';
  defaultCurrency: string;
  // Local reminder notifications (no server — scheduled on-device).
  remindersEnabled: boolean;
  reminderHours: { morning: number; afternoon: number; recap: number };
}

interface SettingsStore {
  settings: Settings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setNotificationPermission: (granted: boolean) => void;
}

const DEFAULT_SETTINGS: Settings = {
  onboardingComplete: false,
  notificationPermissionGranted: false,
  theme: 'dark',
  defaultCurrency: 'INR',
  remindersEnabled: true,
  reminderHours: { morning: 9, afternoon: 14, recap: 22 },
};

async function readFromDisk(): Promise<Settings> {
  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!info.exists) return DEFAULT_SETTINGS;
    const raw = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
      set({ settings, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSetting: async (key, value) => {
    const updated = { ...get().settings, [key]: value };
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
