import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { shareExportedCSV } from '../../src/services/exportService';
import { clearAllData } from '../../src/db/database';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { ensureNotificationPermission, rescheduleReminders } from '../../src/services/notifications';
import dayjs from 'dayjs';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
  iconColor?: string;
}

function SettingRow({ icon, label, description, onPress, danger, rightElement, iconColor }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: `${iconColor ?? Colors.primary}22` }]}>
        <Ionicons name={icon} size={18} color={iconColor ?? Colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
        {description && <Text style={styles.rowDesc}>{description}</Text>}
      </View>
      {rightElement ?? (onPress && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />)}
    </TouchableOpacity>
  );
}

function fmtHour(h: number): string {
  return dayjs().hour(h).minute(0).format('h A');
}

export default function SettingsScreen() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const fetchDashboard = useTransactionStore((s) => s.fetchDashboardData);
  const fetchRecent = useTransactionStore((s) => s.fetchRecentTransactions);

  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const toggleReminders = async (value: boolean) => {
    if (value) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications off',
          'Enable notifications for Ginti in your system settings to receive reminders.'
        );
        return;
      }
    }
    await updateSetting('remindersEnabled', value);
    await rescheduleReminders(value, settings.reminderHours);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await shareExportedCSV();
    } catch (e) {
      Alert.alert('Export failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL transactions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await Promise.all([fetchDashboard(), fetchRecent()]);
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const { morning, afternoon, recap } = settings.reminderHours;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Reminders */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Reminders</Text>
        <Card padding={0}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.primary}22` }]}>
              <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Daily reminders</Text>
              <Text style={styles.rowDesc}>Spend recap + nudges to log expenses</Text>
            </View>
            <Switch
              value={settings.remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
          {settings.remindersEnabled && (
            <>
              <View style={styles.separator} />
              <View style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.scheduleText}>
                  Nudges at {fmtHour(morning)} & {fmtHour(afternoon)} · Recap at {fmtHour(recap)}
                </Text>
              </View>
            </>
          )}
        </Card>
      </View>

      {/* Data section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Data</Text>
        <Card padding={0}>
          <SettingRow
            icon="download-outline"
            label="Export to CSV"
            description="Download all transactions as a CSV file"
            onPress={handleExport}
            iconColor={Colors.success}
            rightElement={isExporting ? <LoadingSpinner size="small" /> : undefined}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="pricetag-outline"
            label="Manage Merchant Tags"
            description="Customize merchant name normalization"
            onPress={() => router.push('/settings/merchant-aliases')}
          />
        </Card>
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Danger Zone</Text>
        <Card padding={0}>
          <SettingRow
            icon="trash-outline"
            label="Clear All Data"
            description="Delete all transactions"
            onPress={handleClearData}
            danger
            iconColor={Colors.error}
          />
        </Card>
      </View>

      {/* App info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>Ginti</Text>
        <Text style={styles.appVersion}>v1.0.0 · Local-first · No cloud</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 48 },

  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 56 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  rowDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
  scheduleText: { fontSize: 12, color: Colors.textSecondary },

  appInfo: { alignItems: 'center', gap: 4, paddingTop: 16 },
  appName: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  appVersion: { fontSize: 12, color: Colors.textMuted },
});
