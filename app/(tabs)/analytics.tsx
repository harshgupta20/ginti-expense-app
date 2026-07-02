import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { formatCurrency, formatPercentage } from '../../src/utils/formatters';
import { getCurrentMonth, getLast7Days } from '../../src/utils/dateUtils';
import dayjs from 'dayjs';

type Period = 'week' | 'month';

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
  const { categoryBreakdown, weeklyData, monthlyData, topMerchants, fetchAnalyticsData } =
    useTransactionStore();
  const [period, setPeriod] = useState<Period>('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    const range = period === 'week' ? getLast7Days() : getCurrentMonth();
    await fetchAnalyticsData(range.start, range.end);
    setIsLoading(false);
  };

  const total = categoryBreakdown.reduce((a, b) => a + b.amount, 0);
  const breakdown = categoryBreakdown.filter((b) => b.amount > 0).slice(0, 10);
  const dailyBars = weeklyData.slice(-7).map((d) => ({ value: d.amount, label: d.label }));
  const monthlyBars = monthlyData.slice(-6).map((d) => ({
    value: d.amount,
    label: dayjs(d.month).format('MMM'),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Period selector */}
      <View style={styles.periodRow}>
        {(['week', 'month'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner label="Loading analytics..." />
      ) : (
        <>
          {/* Total */}
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            <Text style={styles.totalSub}>{period === 'week' ? 'Last 7 days' : dayjs().format('MMMM YYYY')}</Text>
          </Card>

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

          {/* Monthly Trend */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            {monthlyBars.length === 0 || monthlyBars.every((d) => d.value === 0) ? (
              <EmptyState icon="trending-up-outline" title="No trend data yet" />
            ) : (
              <VerticalBars data={monthlyBars} />
            )}
          </Card>

          {/* Top Merchants */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Top Merchants</Text>
            {topMerchants.length === 0 ? (
              <EmptyState icon="storefront-outline" title="No merchant data" />
            ) : (
              <View style={styles.merchantList}>
                {topMerchants.slice(0, 10).map((m, i) => (
                  <View key={m.merchant} style={styles.merchantRow}>
                    <Text style={styles.merchantRank}>#{i + 1}</Text>
                    <Text style={styles.merchantName} numberOfLines={1}>{m.merchant}</Text>
                    <View style={styles.merchantRight}>
                      <Text style={styles.merchantTotal}>{formatCurrency(m.total, true)}</Text>
                      <Text style={styles.merchantCount}>{m.count} txns</Text>
                    </View>
                  </View>
                ))}
              </View>
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

  section: { gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  catList: { gap: 14 },
  catItem: { gap: 6 },
  catTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  catPct: { fontSize: 12, color: Colors.textMuted, width: 38, textAlign: 'right' },
  catAmount: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, width: 70, textAlign: 'right' },

  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, minHeight: 170 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValue: { fontSize: 8, color: Colors.textMuted },
  barTrack: { height: 124, justifyContent: 'flex-end' },
  bar: { width: 22, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: Colors.primary, minHeight: 2 },
  barLabel: { fontSize: 10, color: Colors.textSecondary },

  merchantList: { gap: 12 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  merchantRank: { width: 28, fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  merchantName: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  merchantRight: { alignItems: 'flex-end' },
  merchantTotal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  merchantCount: { fontSize: 11, color: Colors.textMuted },
});
