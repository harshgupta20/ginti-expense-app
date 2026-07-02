import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/colors';
import { Card } from '../src/components/ui/Card';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useBudgetStore } from '../src/stores/budgetStore';
import { formatCurrency } from '../src/utils/formatters';
import dayjs from 'dayjs';

export default function BudgetHistoryScreen() {
  const { history, fetchHistory } = useBudgetStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.month}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const pct = item.totalBudget > 0 ? (item.spent / item.totalBudget) * 100 : 0;
          const over = pct > 100;
          const remaining = item.totalBudget - item.spent;
          return (
            <Card padding={16} style={{ gap: 10 }}>
              <View style={styles.row}>
                <Text style={styles.month}>{dayjs(`${item.month}-01`).format('MMMM YYYY')}</Text>
                <Text style={[styles.pct, { color: over ? Colors.error : Colors.success }]}>
                  {Math.round(pct)}%
                </Text>
              </View>
              <ProgressBar percentage={pct} />
              <View style={styles.row}>
                <Text style={styles.detail}>
                  {formatCurrency(item.spent, true)} of {formatCurrency(item.totalBudget, true)}
                </Text>
                <Text style={[styles.detail, { color: over ? Colors.error : Colors.textSecondary }]}>
                  {over ? `${formatCurrency(-remaining, true)} over` : `${formatCurrency(remaining, true)} left`}
                </Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No budget history"
            description="Set budgets in the Budgets tab and they'll be tracked here month by month."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  month: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  pct: { fontSize: 14, fontWeight: '700' },
  detail: { fontSize: 13, color: Colors.textSecondary },
});
