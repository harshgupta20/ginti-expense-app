import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { DatePickerModal } from '../src/components/DatePickerModal';
import { insertTransaction } from '../src/db/database';
import { useTransactionStore } from '../src/stores/transactionStore';
import { useConfigStore } from '../src/stores/configStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { processDueSubscriptions } from '../src/services/subscriptions';
import { Category, TransactionType, BillingCycle } from '../src/types';
import dayjs from 'dayjs';

const TYPES: { key: TransactionType; label: string; color: string }[] = [
  { key: 'expense', label: 'Expense', color: Colors.expense },
  { key: 'income', label: 'Income', color: Colors.income },
  { key: 'transfer', label: 'Transfer', color: Colors.transfer },
];

const CYCLES: { key: BillingCycle; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

function formatAmount(amount: string): string {
  const n = parseFloat(amount.replace(/,/g, ''));
  return isNaN(n) ? '₹0' : `₹${n.toFixed(0)}`;
}
function formatPerMonth(amount: string): string {
  const n = parseFloat(amount.replace(/,/g, ''));
  return isNaN(n) ? '₹0' : `₹${(n / 12).toFixed(0)}`;
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const fetchDashboard = useTransactionStore((s) => s.fetchDashboardData);
  const fetchRecent = useTransactionStore((s) => s.fetchRecentTransactions);
  const categories = useConfigStore((s) => s.categories);
  const paymentSources = useConfigStore((s) => s.paymentSources);
  const members = useConfigStore((s) => s.members);
  const addSubscription = useSubscriptionStore((s) => s.add);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Others');
  const [type, setType] = useState<TransactionType>('expense');
  const [note, setNote] = useState('');
  const [paymentSource, setPaymentSource] = useState<string | null>(null);
  const [paidByMemberId, setPaidByMemberId] = useState<number | null>(null);
  // Transaction date — defaults to today, or a date passed from the calendar.
  const [date, setDate] = useState<string>(() => {
    const d = params.date ? dayjs(params.date) : dayjs();
    return d.isValid() ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
  });
  const [dateModal, setDateModal] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState(Math.min(dayjs().date(), 28));
  const [isSaving, setIsSaving] = useState(false);

  const isToday = date === dayjs().format('YYYY-MM-DD');
  // Keep the current wall-clock time when logging for today; otherwise anchor at
  // local noon so the entry lands squarely on the chosen calendar day.
  const timestampFor = (d: string): string =>
    d === dayjs().format('YYYY-MM-DD')
      ? dayjs().toISOString()
      : dayjs(`${d}T12:00:00`).toISOString();

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    // The note doubles as the transaction's label/description; fall back to the
    // category name when left blank.
    const label = note.trim() || category;

    setIsSaving(true);
    try {
      if (recurring && type === 'expense') {
        // Create a subscription and let the processor generate the due charges,
        // so it stays in sync going forward. Daily/weekly charge forward-only
        // from creation; monthly/yearly backfill from the chosen start month.
        await addSubscription({
          name: label,
          amount: parsedAmount,
          billing_cycle: cycle,
          category,
          payment_source: paymentSource,
          paid_by_member_id: paidByMemberId,
          day_of_month: dayOfMonth,
          start_month: dayjs(date).format('YYYY-MM'),
          active: 1,
        });
        await processDueSubscriptions();
      } else {
        await insertTransaction({
          amount: parsedAmount,
          merchant_name: label,
          normalized_merchant_name: label,
          category,
          source_app: paymentSource ?? 'Manual',
          transaction_type: type,
          confidence_score: 1.0,
          raw_notification_id: null,
          transaction_timestamp: timestampFor(date),
          needs_review: 0,
          payment_source: paymentSource,
          paid_by_member_id: paidByMemberId,
          note: note.trim() || null,
        });
      }

      await Promise.all([fetchDashboard(), fetchRecent()]);
      router.back();
    } catch (e) {
      console.error('Failed to save transaction:', e);
      Alert.alert('Error', 'Could not save transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <Card style={styles.amountCard}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </Card>

        {/* Type toggle */}
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, type === t.key && { backgroundColor: t.color }]}
              onPress={() => setType(t.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeBtnText, type === t.key && styles.typeBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note / Description (optional) */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Note / Description (optional)</Text>
          <Card style={styles.inputCard}>
            <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Swiggy dinner, Netflix, Electricity bill"
              placeholderTextColor={Colors.textMuted}
              value={note}
              onChangeText={setNote}
              returnKeyType="done"
            />
          </Card>
        </View>

        {/* Paid via (payment source) */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Paid via</Text>
          <View style={styles.categoryGrid}>
            {paymentSources.map((ps) => {
              const isSelected = paymentSource === ps.name;
              return (
                <TouchableOpacity
                  key={ps.id}
                  style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                  onPress={() => setPaymentSource(isSelected ? null : ps.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={ps.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                    {ps.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Paid by (member) */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Paid by</Text>
          <View style={styles.categoryGrid}>
            {members.map((m) => {
              const isSelected = paidByMemberId === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                  onPress={() => setPaidByMemberId(isSelected ? null : m.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="person"
                    size={14}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const color = cat.color ?? Colors.primary;
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    isSelected && { backgroundColor: `${color}33`, borderColor: color },
                  ]}
                  onPress={() => setCategory(cat.name)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.catChipText, isSelected && { color }]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recurring / Subscription */}
        {type === 'expense' && (
          <Card style={styles.recurringCard}>
            <View style={styles.recurringHeader}>
              <View style={styles.recurringLabelWrap}>
                <Ionicons name="repeat" size={18} color={recurring ? Colors.primary : Colors.textMuted} />
                <View>
                  <Text style={styles.recurringTitle}>Make it a subscription</Text>
                  <Text style={styles.recurringSub}>Auto-add this every month</Text>
                </View>
              </View>
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ true: Colors.primary, false: Colors.border }}
                thumbColor="#fff"
              />
            </View>

            {recurring && (
              <View style={styles.recurringBody}>
                <Text style={styles.fieldLabel}>Billing cycle</Text>
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
                    <Text style={styles.fieldLabel}>Charge on day</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={[styles.dayChip, dayOfMonth === d && styles.dayChipActive]}
                          onPress={() => setDayOfMonth(d)}
                        >
                          <Text style={[styles.dayChipText, dayOfMonth === d && styles.dayChipTextActive]}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Text style={styles.recurringHint}>
                  {cycle === 'daily'
                    ? `${formatAmount(amount)} will be added every day, starting today.`
                    : cycle === 'weekly'
                      ? `${formatAmount(amount)} will be added every week, starting today.`
                      : cycle === 'yearly'
                        ? `≈ ${formatPerMonth(amount)} will be added each month (yearly ÷ 12).`
                        : `${formatAmount(amount)} will be added on day ${dayOfMonth} every month.`}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Date selector */}
        {!recurring && (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity style={styles.dateSelector} onPress={() => setDateModal(true)} activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.dateSelectorText}>
                {dayjs(date).format('DD MMM YYYY')}
                {isToday ? ` · ${dayjs().format('hh:mm A')}` : ''}
              </Text>
              {!isToday && (
                <TouchableOpacity onPress={() => setDate(dayjs().format('YYYY-MM-DD'))} hitSlop={8}>
                  <Text style={styles.dateReset}>Today</Text>
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <Button
          label={isSaving ? 'Saving…' : recurring ? 'Save Subscription' : 'Save Transaction'}
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveBtn}
        />
      </ScrollView>

      <DatePickerModal
        visible={dateModal}
        value={date}
        maxDate={dayjs().format('YYYY-MM-DD')}
        onSelect={setDate}
        onClose={() => setDateModal(false)}
        title="Transaction date"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 48 },

  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  typeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  typeBtnTextActive: { color: '#fff' },

  field: { gap: 8 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 2,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  catChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  tagChipSelected: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  tagChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  tagChipTextSelected: { color: Colors.primary },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateSelectorText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  dateReset: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  recurringCard: { gap: 12, paddingVertical: 14 },
  recurringHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recurringLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recurringTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  recurringSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  recurringBody: { gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
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
  dayScroll: { flexGrow: 0 },
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
  recurringHint: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  saveBtn: { marginTop: 4 },
});
