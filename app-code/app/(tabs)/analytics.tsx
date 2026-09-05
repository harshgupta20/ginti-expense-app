import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { formatCurrency, formatPercentage, formatDate } from '../../src/utils/formatters';
import { getCurrentMonth, getLast7Days } from '../../src/utils/dateUtils';
import dayjs from 'dayjs';

type Period = 'week' | 'month' | 'year';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function rangeFor(period: Period): { start: string; end: string } {
  if (period === 'week') return getLast7Days();
  if (period === 'year') {
    return { start: dayjs().startOf('year').toISOString(), end: dayjs().endOf('year').toISOString() };
  }
  return getCurrentMonth();
}

/** Lightweight vertical bar chart built from plain Views — no native chart lib. */
function VerticalBars({ data }: { data: { value: number; label: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.barsRow}>
      {data.map((d, i) => {
        const h = max > 0 ? Math.max((d.value / max) * 120, d.value > 0 ? 4 : 0) : 0;
        return (
          <View key={`${d.label}-${i}`} style={styles.barCol}>
            {d.value > 0 && (
              <Text style={styles.barValue} numberOfLines={1}>
                {formatCurrency(d.value, true)}
              </Text>
            )}
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: h }]} />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function AnalyticsScreen() {
  const {
    categoryBreakdown,
    weeklyData,
    monthlyData,
    periodTotals,
    paymentSourceStats,
    weekdaySpend,
    prevPeriodExpense,
    fetchAnalyticsData,
  } = useTransactionStore();
  const [period, setPeriod] = useState<Period>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const range = rangeFor(period);
    await fetchAnalyticsData(range.start, range.end);
    setIsLoading(false);
  }, [period, fetchAnalyticsData]);

  // Refetch whenever the screen gains focus (or the period changes) so newly
  // added transactions are always reflected.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    const range = rangeFor(period);
    await fetchAnalyticsData(range.start, range.end);
    setRefreshing(false);
  };

  const total = categoryBreakdown.reduce((a, b) => a + b.amount, 0);
  const breakdown = categoryBreakdown.filter((b) => b.amount > 0).slice(0, 10);
  const dailyBars = weeklyData.slice(-7).map((d) => ({ value: d.amount, label: d.label }));
  const monthlyBars = monthlyData.slice(-6).map((d) => ({
    value: d.amount,
    label: dayjs(d.month).format('MMM'),
  }));
  const weekdayBars = WEEKDAY_LABELS.map((label, i) => ({
    value: weekdaySpend.find((w) => w.weekday === i)?.amount ?? 0,
    label,
  }));

  const net = periodTotals.income - periodTotals.expense;
  const delta = periodTotals.expense - prevPeriodExpense;
  const deltaPct = prevPeriodExpense > 0 ? (delta / prevPeriodExpense) * 100 : null;
  const periodLabel = period === 'week' ? 'last 7 days' : period === 'year' ? 'this year' : 'this month';
  const prevLabel = period === 'week' ? 'prior 7 days' : period === 'year' ? 'last year' : 'last month';
  const sourceTotal = paymentSourceStats.reduce((a, s) => a + s.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Period selector */}
      <View style={styles.periodRow}>
        {(['week', 'month', 'year'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === 'week' ? 'Week' : p === 'year' ? 'Year' : 'Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner label="Loading analytics..." />
      ) : (
        <>
          {/* Total + comparison */}
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalValue}>{formatCurrency(periodTotals.expense)}</Text>
            <Text style={styles.totalSub}>
              {period === 'week' ? 'Last 7 days' : period === 'year' ? dayjs().format('YYYY') : dayjs().format('MMMM YYYY')}
            </Text>
            {deltaPct !== null && (
              <View style={[styles.deltaPill, { backgroundColor: delta > 0 ? Colors.errorDim : Colors.successDim }]}>
                <Ionicons
                  name={delta > 0 ? 'arrow-up' : 'arrow-down'}
                  size={12}
                  color={delta > 0 ? Colors.expense : Colors.success}
                />
                <Text style={[styles.deltaText, { color: delta > 0 ? Colors.expense : Colors.success }]}>
                  {formatPercentage(Math.abs(deltaPct), 0)} vs {prevLabel}
                </Text>
              </View>
            )}
          </Card>

          {/* Money flow: income / expense / net */}
          <Card style={styles.flowCard}>
            <View style={styles.flowItem}>
              <Text style={styles.flowLabel}>Income</Text>
              <Text style={[styles.flowValue, { color: Colors.income }]}>{formatCurrency(periodTotals.income, true)}</Text>
            </View>
            <View style={styles.flowDivider} />
            <View style={styles.flowItem}>
              <Text style={styles.flowLabel}>Expense</Text>
              <Text style={[styles.flowValue, { color: Colors.expense }]}>{formatCurrency(periodTotals.expense, true)}</Text>
            </View>
            <View style={styles.flowDivider} />
            <View style={styles.flowItem}>
              <Text style={styles.flowLabel}>Net</Text>
              <Text style={[styles.flowValue, { color: net >= 0 ? Colors.success : Colors.expense }]}>
                {net < 0 ? '-' : ''}{formatCurrency(Math.abs(net), true)}
              </Text>
            </View>
          </Card>

          {/* Quick insights */}
          <View style={styles.insightRow}>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Transactions</Text>
              <Text style={styles.insightValue}>{periodTotals.count}</Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Avg / txn</Text>
              <Text style={styles.insightValue}>{formatCurrency(periodTotals.avgExpense, true)}</Text>
            </View>
          </View>
          {periodTotals.biggestExpense && (
            <Card style={styles.biggestCard}>
              <Ionicons name="flame" size={20} color={Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.biggestLabel}>Biggest expense</Text>
                <Text style={styles.biggestName} numberOfLines={1}>
                  {periodTotals.biggestExpense.name} · {formatDate(periodTotals.biggestExpense.date, 'DD MMM')}
                </Text>
              </View>
              <Text style={styles.biggestAmount}>{formatCurrency(periodTotals.biggestExpense.amount, true)}</Text>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {breakdown.length === 0 ? (
              <EmptyState icon="pie-chart-outline" title="No data" description="No expense data for this period." />
            ) : (
              <View style={styles.catList}>
                {breakdown.map((item, i) => {
                  const color = Colors.categoryColors[item.category] ?? Colors.chart[i % Colors.chart.length];
                  const pct = total > 0 ? (item.amount / total) * 100 : 0;
                  return (
                    <View key={item.category} style={styles.catItem}>
                      <View style={styles.catTop}>
                        <View style={[styles.catDot, { backgroundColor: color }]} />
                        <Text style={styles.catName} numberOfLines={1}>{item.category}</Text>
                        <Text style={styles.catPct}>{formatPercentage(pct, 0)}</Text>
                        <Text style={styles.catAmount}>{formatCurrency(item.amount, true)}</Text>
                      </View>
                      <ProgressBar percentage={pct} color={color} height={6} />
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Daily Spending */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Spending</Text>
            {dailyBars.length === 0 || dailyBars.every((d) => d.value === 0) ? (
              <EmptyState icon="bar-chart-outline" title="No data" />
            ) : (
              <VerticalBars data={dailyBars} />
            )}
          </Card>

          {/* Spending by Weekday */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Weekday</Text>
            {weekdayBars.every((d) => d.value === 0) ? (
              <EmptyState icon="calendar-outline" title="No data" />
            ) : (
              <VerticalBars data={weekdayBars} />
            )}
          </Card>

          {/* Payment Sources */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Payment Source</Text>
            {paymentSourceStats.length === 0 ? (
              <EmptyState icon="card-outline" title="No data" />
            ) : (
              <View style={styles.catList}>
                {paymentSourceStats.slice(0, 8).map((s, i) => {
                  const color = Colors.chart[i % Colors.chart.length];
                  const pct = sourceTotal > 0 ? (s.amount / sourceTotal) * 100 : 0;
                  return (
                    <View key={s.source} style={styles.catItem}>
                      <View style={styles.catTop}>
                        <View style={[styles.catDot, { backgroundColor: color }]} />
                        <Text style={styles.catName} numberOfLines={1}>{s.source}</Text>
                        <Text style={styles.catPct}>{s.count}×</Text>
                        <Text style={styles.catAmount}>{formatCurrency(s.amount, true)}</Text>
                      </View>
                      <ProgressBar percentage={pct} color={color} height={6} />
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Monthly Trend */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            {monthlyBars.length === 0 || monthlyBars.every((d) => d.value === 0) ? (
              <EmptyState icon="trending-up-outline" title="No trend data yet" />
            ) : (
              <VerticalBars data={monthlyBars} />
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  periodTextActive: { color: '#fff' },

  totalCard: { alignItems: 'center', gap: 2, paddingVertical: 20 },
  totalLabel: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 34, fontWeight: '800', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  totalSub: { fontSize: 12, color: Colors.textMuted },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 6,
  },
  deltaText: { fontSize: 12, fontWeight: '700' },

  flowCard: { flexDirection: 'row', paddingVertical: 16 },
  flowItem: { flex: 1, alignItems: 'center', gap: 4 },
  flowLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  flowValue: { fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
  flowDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  insightRow: { flexDirection: 'row', gap: 12 },
  insightCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 4,
  },
  insightLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  insightValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, fontVariant: ['tabular-nums'] },

  biggestCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  biggestLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  biggestName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  biggestAmount: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  section: { gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  catList: { gap: 14 },
  catItem: { gap: 6 },
  catTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  catPct: { fontSize: 12, color: Colors.textMuted, width: 44, textAlign: 'right' },
  catAmount: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, width: 70, textAlign: 'right' },

  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, minHeight: 170 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValue: { fontSize: 8, color: Colors.textMuted },
  barTrack: { height: 124, justifyContent: 'flex-end' },
  bar: { width: 22, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: Colors.primary, minHeight: 2 },
  barLabel: { fontSize: 10, color: Colors.textSecondary },
});
