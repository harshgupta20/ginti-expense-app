import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FAB } from '../../src/components/ui/FAB';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { monthlyCharge } from '../../src/services/subscriptions';
import { formatCurrency } from '../../src/utils/formatters';
import { Subscription, BillingCycle } from '../../src/types';
import dayjs from 'dayjs';

function nextChargeDate(day: number): string {
  const today = dayjs();
  const d = Math.min(day, 28);
  const thisMonth = today.date(d);
  const next = today.date() <= d ? thisMonth : thisMonth.add(1, 'month');
  return next.format('DD MMM');
}

const CYCLES: { key: BillingCycle; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

/** Human-readable "amount / cadence · next" summary line for a subscription. */
function subMeta(sub: Subscription, paused: boolean): string {
  let amountPart: string;
  switch (sub.billing_cycle) {
    case 'daily':
      amountPart = `${formatCurrency(sub.amount)}/day`;
      break;
    case 'weekly':
      amountPart = `${formatCurrency(sub.amount)}/wk`;
      break;
    case 'yearly':
      amountPart = `${formatCurrency(sub.amount)}/yr · ${formatCurrency(monthlyCharge(sub), true)}/mo`;
      break;
    default:
      amountPart = `${formatCurrency(sub.amount)}/mo`;
  }
  let nextPart: string;
  if (paused) nextPart = 'Paused';
  else if (sub.billing_cycle === 'daily') nextPart = 'every day';
  else if (sub.billing_cycle === 'weekly') nextPart = 'every week';
  else nextPart = `next ${nextChargeDate(sub.day_of_month)}`;
  return `${amountPart} · ${nextPart}`;
}

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { subscriptions, load, edit, remove, toggleActive } = useSubscriptionStore();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [day, setDay] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const monthlyTotal = subscriptions
    .filter((s) => s.active === 1)
    .reduce((a, s) => a + monthlyCharge(s), 0);

  const openEdit = (sub: Subscription) => {
    setEditing(sub);
    setAmountInput(String(sub.amount));
    setCycle(sub.billing_cycle);
    setDay(sub.day_of_month);
  };

  const handleSave = async () => {
    if (!editing) return;
    const amount = parseFloat(amountInput);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await edit(editing.id, { amount, billing_cycle: cycle, day_of_month: day });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (sub: Subscription) => {
    Alert.alert(
      'Delete subscription',
      `Stop "${sub.name}"? Past charges stay in your history; no new ones will be added.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove(sub.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {subscriptions.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Active monthly cost</Text>
          <Text style={styles.summaryValue}>{formatCurrency(monthlyTotal)}/mo</Text>
        </View>
      )}

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const paused = item.active === 0;
          return (
            <Card padding={14} style={StyleSheet.flatten([styles.card, paused && styles.cardPaused])}>
              <View style={styles.row}>
                <CategoryIcon category={item.category} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{subMeta(item, paused)}</Text>
                </View>
                <Switch
                  value={item.active === 1}
                  onValueChange={(v) => toggleActive(item.id, v)}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Ionicons name="pencil" size={15} color={Colors.textSecondary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={15} color={Colors.error} />
                  <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="repeat-outline"
            title="No subscriptions"
            description="Add a recurring expense from the + button (toggle 'Make it a subscription')."
          >
            <Button label="Add Subscription" variant="secondary" onPress={() => router.push('/add-transaction')} />
          </EmptyState>
        }
      />

      <FAB />

      {/* Edit modal */}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{editing?.name}</Text>

            <Text style={styles.label}>
              Amount ({cycle === 'daily' ? 'per day' : cycle === 'weekly' ? 'per week' : cycle === 'yearly' ? 'per year' : 'per month'})
            </Text>
            <View style={styles.amountInput}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.input}
                value={amountInput}
                onChangeText={setAmountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <Text style={styles.label}>Billing cycle</Text>
            <View style={styles.cycleRow}>
              {CYCLES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.cycleBtn, cycle === c.key && styles.cycleBtnActive]}
                  onPress={() => setCycle(c.key)}
                >
                  <Text style={[styles.cycleText, cycle === c.key && styles.cycleTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(cycle === 'monthly' || cycle === 'yearly') && (
              <>
                <Text style={styles.label}>Charge on day</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayChip, day === d && styles.dayChipActive]}
                      onPress={() => setDay(d)}
                    >
                      <Text style={[styles.dayChipText, day === d && styles.dayChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.sheetActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditing(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  list: { padding: 16, paddingBottom: 100 },
  card: { gap: 12 },
  cardPaused: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 18, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  overlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 50,
  },
  currency: { fontSize: 20, fontWeight: '600', color: Colors.textSecondary },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  cycleRow: { flexDirection: 'row', gap: 8 },
  cycleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  cycleBtnActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  cycleText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  cycleTextActive: { color: Colors.primary },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  dayChipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  dayChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  dayChipTextActive: { color: Colors.primary },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
