import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { initDatabase } from '../src/db/database';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useConfigStore } from '../src/stores/configStore';
import { checkForUpdatesInBackground } from '../src/services/otaUpdates';
import { Colors } from '../src/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const loadConfig = useConfigStore((s) => s.load);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await Promise.all([loadSettings(), loadConfig()]);
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        SplashScreen.hideAsync();
        // Fire-and-forget: check for OTA updates AFTER the app is up. Not
        // awaited, so it can never delay startup; all failures are handled
        // inside the service. A staged update applies on the next cold launch.
        void checkForUpdatesInBackground();
      }
    }
    init();
  }, []);

  if (!isLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="permission" options={{ title: 'Reminders', headerBackVisible: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transaction/[id]" options={{ title: 'Transaction Details' }} />
        <Stack.Screen name="review-queue" options={{ title: 'Needs Review' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
        <Stack.Screen name="settings/categories" options={{ title: 'Manage Categories' }} />
        <Stack.Screen name="configure/categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="configure/payment-sources" options={{ title: 'Payment Sources' }} />
        <Stack.Screen name="configure/members" options={{ title: 'People' }} />
        <Stack.Screen name="configure/subscriptions" options={{ title: 'Subscriptions' }} />
        <Stack.Screen name="configure/export-report" options={{ title: 'Export Report' }} />
        <Stack.Screen name="budget-history" options={{ title: 'Budget History' }} />
        <Stack.Screen name="add-transaction" options={{ title: 'Add Transaction', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
