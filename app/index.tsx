import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function Index() {
  const { onboardingComplete } = useSettingsStore((s) => s.settings);
  const isLoaded = useSettingsStore((s) => s.isLoaded);

  if (!isLoaded) return null;

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
