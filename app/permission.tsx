import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { Button } from '../src/components/ui/Button';
import { ensureNotificationPermission } from '../src/services/notifications';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function PermissionScreen() {
  const router = useRouter();
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const [granted, setGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleEnable = async () => {
    setRequesting(true);
    const ok = await ensureNotificationPermission();
    setGranted(ok);
    await updateSetting('remindersEnabled', ok);
    setRequesting(false);
    if (ok) router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await updateSetting('remindersEnabled', false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications" size={72} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Stay on top of your spending</Text>

        <Text style={styles.description}>
          Ginti sends a gentle daily recap of what you spent, plus a couple of fun
          nudges to log your expenses. No spam — just 3 friendly pings a day, fully on your device.
        </Text>

        <View style={styles.bullets}>
          {[
            { icon: 'moon-outline', text: 'A nightly recap of today\'s spending' },
            { icon: 'sparkles-outline', text: 'Cool reminders to log your spends' },
            { icon: 'lock-closed-outline', text: 'Scheduled locally — nothing leaves your phone' },
          ].map((b) => (
            <View key={b.text} style={styles.bullet}>
              <Ionicons name={b.icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors.primary} />
              <Text style={styles.bulletText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={granted ? 'Reminders On 🎉' : 'Enable Reminders'}
          onPress={handleEnable}
          loading={requesting}
          size="lg"
          fullWidth
        />
        <Button label="Maybe later" onPress={handleSkip} variant="ghost" size="md" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 20 },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  description: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  bullets: { alignSelf: 'stretch', gap: 14, marginTop: 8 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletText: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  footer: { padding: 24, paddingBottom: 40, gap: 10 },
});
