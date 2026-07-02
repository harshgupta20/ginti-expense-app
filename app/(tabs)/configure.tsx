import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { useConfigStore } from '../../src/stores/configStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { exportBackup, importBackup } from '../../src/services/backupService';

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  count?: number;
  color: string;
  onPress: () => void;
}

function ConfigRow({ icon, label, description, count, color, onPress }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      {count != null && (
        <View style={styles.countPill}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ConfigureScreen() {
  const router = useRouter();
  const { categories, paymentSources, members, load } = useConfigStore();
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const loadSubs = useSubscriptionStore((s) => s.load);
  const [busy, setBusy] = useState<null | 'export' | 'import'>(null);

  useEffect(() => {
    load();
    loadSubs();
  }, []);

  const activeSubs = subscriptions.filter((s) => s.active === 1).length;

  const handleExportBackup = async () => {
    setBusy('export');
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert('Export failed', 'Could not create the backup file.');
    } finally {
      setBusy(null);
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      'Restore from backup',
      'This will REPLACE all current data in the app with the backup file. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose file',
          style: 'destructive',
          onPress: async () => {
            setBusy('import');
            try {
              const res = await importBackup();
              if (res.cancelled) return;
              if (!res.ok) {
                Alert.alert('Import failed', res.message);
                return;
              }
              // Reload everything from the freshly restored database.
              await Promise.all([load(), loadSubs()]);
              await Promise.all([
                useTransactionStore.getState().fetchDashboardData(),
                useTransactionStore.getState().fetchRecentTransactions(),
                useBudgetStore.getState().fetchBudgetProgress(),
              ]);
              Alert.alert(
                'Restored',
                `Imported ${res.counts?.transactions ?? 0} transactions and ${res.counts?.subscriptions ?? 0} subscriptions.`
              );
            } catch (e) {
              Alert.alert('Import failed', 'The backup could not be restored.');
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Data</Text>
      <Card padding={4}>
        <ConfigRow
          icon="pricetags"
          label="Categories"
          description="Add, edit & remove spending categories"
          count={categories.length}
          color={Colors.primary}
          onPress={() => router.push('/configure/categories')}
        />
        <View style={styles.divider} />
        <ConfigRow
          icon="card"
          label="Payment Sources"
          description="Apps & methods you pay with"
          count={paymentSources.length}
          color="#06B6D4"
          onPress={() => router.push('/configure/payment-sources')}
        />
        <View style={styles.divider} />
        <ConfigRow
          icon="people"
          label="People"
          description="Who paid — you, family or friends"
          count={members.length}
          color="#EC4899"
          onPress={() => router.push('/configure/members')}
        />
        <View style={styles.divider} />
        <ConfigRow
          icon="repeat"
          label="Subscriptions"
          description="Recurring daily, weekly, monthly & yearly charges"
          count={activeSubs}
          color="#A855F7"
          onPress={() => router.push('/configure/subscriptions')}
        />
      </Card>

      <Text style={styles.sectionTitle}>Budgets</Text>
      <Card padding={4}>
        <ConfigRow
          icon="wallet"
          label="Manage Budgets"
          description="Overall & per-category limits by month"
          color="#22C55E"
          onPress={() => router.push('/(tabs)/budgets')}
        />
        <View style={styles.divider} />
        <ConfigRow
          icon="time"
          label="Budget History"
          description="Past months: budget vs actual spend"
          color="#8B5CF6"
          onPress={() => router.push('/budget-history')}
        />
      </Card>

      <Text style={styles.sectionTitle}>Export & Backup</Text>
      <Card padding={4}>
        <ConfigRow
          icon="document-text"
          label="Export Report"
          description="Filter by date, month, year or category — CSV or table"
          color="#06B6D4"
          onPress={() => router.push('/configure/export-report')}
        />
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row} onPress={handleExportBackup} activeOpacity={0.7} disabled={busy !== null}>
          <View style={[styles.rowIcon, { backgroundColor: '#22C55E22' }]}>
            <Ionicons name="cloud-upload" size={20} color="#22C55E" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Backup data</Text>
            <Text style={styles.rowDesc}>Save a full data file to move to a new phone</Text>
          </View>
          {busy === 'export' ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="share-outline" size={18} color={Colors.textMuted} />}
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row} onPress={handleImportBackup} activeOpacity={0.7} disabled={busy !== null}>
          <View style={[styles.rowIcon, { backgroundColor: '#F59E0B22' }]}>
            <Ionicons name="cloud-download" size={20} color="#F59E0B" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Restore data</Text>
            <Text style={styles.rowDesc}>Import a backup file (replaces current data)</Text>
          </View>
          {busy === 'import' ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>App</Text>
      <Card padding={4}>
        <ConfigRow
          icon="settings"
          label="Settings"
          description="Reminders, export & data"
          color={Colors.textSecondary}
          onPress={() => router.push('/settings')}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowDesc: { fontSize: 12, color: Colors.textSecondary },
  countPill: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 10,
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: 'center',
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 56 },
});
