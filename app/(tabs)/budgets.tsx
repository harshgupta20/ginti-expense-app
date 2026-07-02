import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useBudget } from '../../src/hooks/useBudget';
import { OVERALL_KEY } from '../../src/stores/budgetStore';
import { useConfigStore } from '../../src/stores/configStore';
import { BudgetCard } from '../../src/components/BudgetCard';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatCurrency } from '../../src/utils/formatters';
import dayjs from 'dayjs';

type Target = { kind: 'overall' } | { kind: 'category'; category: string };

export default function BudgetsScreen() {
  const router = useRouter();
  const { selectedMonth, overall, categoryProgress, isLoading, setMonth, setBudget, clearBudget, refresh } =
    useBudget();
  const categories = useConfigStore((s) => s.categories);

  const [modalVisible, setModalVisible] = useState(false);
  const [target, setTarget] = useState<Target>({ kind: 'overall' });
  const [limitInput, setLimitInput] = useState('');
  const [pickCategory, setPickCategory] = useState<string>('Food');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const monthLabel = dayjs(`${selectedMonth}-01`).format('MMMM YYYY');
  const isCurrentMonth = selectedMonth === dayjs().format('YYYY-MM');

  const goPrev = () => setMonth(dayjs(`${selectedMonth}-01`).subtract(1, 'month').format('YYYY-MM'));
  const goNext = () => setMonth(dayjs(`${selectedMonth}-01`).add(1, 'month').format('YYYY-MM'));

  const budgetedCategories = categoryProgress.map((p) => p.category);
  const availableCategories = categories
    .map((c) => c.name)
    .filter((c) => !budgetedCategories.includes(c) && c !== 'Income' && c !== 'Transfers');

  // Totals: prefer the explicit overall budget, else sum of category budgets.
  const totalCategoryBudget = categoryProgress.reduce((a, p) => a + p.limit, 0);
  const totalBudget = overall ? overall.limit : totalCategoryBudget;
  const totalSpent = overall ? overall.spent : categoryProgress.reduce((a, p) => a + p.spent, 0);

  const openOverall = () => {
    setTarget({ kind: 'overall' });
    setLimitInput(overall ? String(overall.limit) : '');
    setModalVisible(true);
  };

  const openCategoryNew = () => {
    if (availableCategories.length === 0) return;
    setTarget({ kind: 'category', category: availableCategories[0] });
    setPickCategory(availableCategories[0]);
    setLimitInput('');
    setModalVisible(true);
  };

  const openCategoryEdit = (category: string, currentLimit: number) => {
    setTarget({ kind: 'category', category });
    setPickCategory(category);
    setLimitInput(String(currentLimit));
    setModalVisible(true);
  };

  const handleSave = async () => {
    const limit = parseFloat(limitInput);
    if (!limit || limit <= 0) return;
    setSaving(true);
    try {
      const category = target.kind === 'overall' ? null : pickCategory;
      await setBudget(category, limit);
      setModalVisible(false);
      setLimitInput('');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (category: string, periodId: number | null, carried: boolean) => {
    if (periodId == null) {
      Alert.alert(
        'Carried-forward budget',
        carried
          ? 'This budget carried over from a previous month. Edit it to set a value for this month, or remove it in the month it was created.'
          : 'No explicit budget to remove for this month.'
      );
      return;
    }
    Alert.alert('Remove budget', `Remove the ${category === OVERALL_KEY ? 'overall' : category} budget for ${monthLabel}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => clearBudget(periodId) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Month selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goPrev} hitSlop={10} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthLabel}
          {isCurrentMonth ? '' : ''}
        </Text>
        <TouchableOpacity onPress={goNext} hitSlop={10} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categoryProgress}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Budget</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryValue, { color: Colors.expense }]}>{formatCurrency(totalSpent)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
                </Text>
              </View>
            </View>

            {/* Overall budget */}
            {overall ? (
              <View style={styles.budgetRow}>
                <BudgetCard progress={overall} onPress={openOverall} />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(OVERALL_KEY, overall.periodId, overall.carriedForward)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.setOverallBtn} onPress={openOverall} activeOpacity={0.8}>
                <Ionicons name="wallet" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.setOverallTitle}>Set overall budget</Text>
                  <Text style={styles.setOverallSub}>One limit across all categories this month</Text>
                </View>
                <Ionicons name="add-circle" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>By Category</Text>
              <TouchableOpacity onPress={() => router.push('/budget-history')} hitSlop={8}>
                <Text style={styles.historyLink}>History ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.budgetRow}>
            <BudgetCard progress={item} onPress={() => openCategoryEdit(item.category, item.limit)} />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(item.category, item.periodId, item.carriedForward)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="wallet-outline"
              title="No category budgets"
              description="Add per-category limits for this month. Budgets carry forward automatically."
            />
          ) : null
        }
        ListFooterComponent={
          availableCategories.length > 0 ? (
            <TouchableOpacity style={styles.addMoreBtn} onPress={openCategoryNew} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addMoreText}>Add Category Budget</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>
              {target.kind === 'overall' ? 'Overall Budget' : 'Category Budget'} · {monthLabel}
            </Text>

            {target.kind === 'category' && (
              <>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {/* When editing an existing category, lock to it; when adding, choose from available. */}
                  {(budgetedCategories.includes(pickCategory) ? [pickCategory] : availableCategories).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, pickCategory === cat && styles.catChipSelected]}
                      onPress={() => setPickCategory(cat)}
                    >
                      <Text style={[styles.catChipText, pickCategory === cat && styles.catChipTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.label}>Monthly Limit</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                value={limitInput}
                onChangeText={setLimitInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <Text style={styles.hint}>
              This amount carries forward to future months until you change it.
            </Text>

            <Button
              label="Save Budget"
              onPress={handleSave}
              loading={saving}
              fullWidth
              disabled={!limitInput || parseFloat(limitInput) <= 0}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  headerArea: { gap: 12 },

  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  setOverallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryDim,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    padding: 16,
  },
  setOverallTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  setOverallSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  historyLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingVertical: 16, gap: 12, paddingBottom: 32 },

  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { padding: 8 },

  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginTop: 8,
    backgroundColor: Colors.primaryDim,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  addMoreText: { fontSize: 15, fontWeight: '600', color: Colors.primary },

  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    paddingBottom: 44,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: -4 },

  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  catChipSelected: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  catChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catChipTextSelected: { color: Colors.primary },

  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
  },
  currencySymbol: { fontSize: 22, fontWeight: '600', color: Colors.textSecondary },
  input: { flex: 1, fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
});
