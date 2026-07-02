import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { getTransactionsByDateRange, getDailySpend } from '../../src/db/database';
import { Transaction } from '../../src/types';
import { TransactionItem } from '../../src/components/TransactionItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../src/utils/formatters';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from '../../src/utils/dateUtils';
import dayjs from 'dayjs';

interface DayCellProps {
  date?: DateData;
  state?: string;
  amount: number;
  isSelected: boolean;
  onPress: (dateString: string) => void;
}

function DayCell({ date, state, amount, isSelected, onPress }: DayCellProps) {
  if (!date) return <View style={styles.dayCell} />;
  const isToday = state === 'today';
  const disabled = state === 'disabled';

  return (
    <TouchableOpacity
      style={styles.dayCell}
      onPress={() => onPress(date.dateString)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.dayNumWrap, isSelected && styles.dayNumSelected]}>
        <Text
          style={[
            styles.dayNum,
            isToday && !isSelected && styles.dayNumToday,
            isSelected && styles.dayNumSelectedText,
            disabled && styles.dayNumDisabled,
          ]}
        >
          {date.day}
        </Text>
      </View>
      {amount > 0 ? (
        <Text style={[styles.dayAmount, isSelected && styles.dayAmountSelected]} numberOfLines={1}>
          {formatCurrency(amount, true)}
        </Text>
      ) : (
        <Text style={styles.dayAmount}> </Text>
      )}
    </TouchableOpacity>
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [spendByDate, setSpendByDate] = useState<Record<string, number>>({});
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([]);
  const [dayTotal, setDayTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadMonthData = useCallback(async () => {
    const start = startOfMonth(currentMonth.toDate());
    const end = endOfMonth(currentMonth.toDate());
    const dailyData = await getDailySpend(start, end);
    const map: Record<string, number> = {};
    for (const { date, amount } of dailyData) {
      map[date] = amount;
    }
    setSpendByDate(map);
  }, [currentMonth]);

  const loadDayTransactions = useCallback(async (date: string) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    const txs = await getTransactionsByDateRange(start, end);
    const total = txs.filter((t) => t.transaction_type === 'expense').reduce((a, t) => a + t.amount, 0);
    setDayTransactions(txs);
    setDayTotal(total);
  }, []);

  // Reload on focus (e.g. after adding a transaction) and whenever the visible
  // month or selected day changes.
  useFocusEffect(
    useCallback(() => {
      loadMonthData();
      loadDayTransactions(selectedDate);
    }, [loadMonthData, loadDayTransactions, selectedDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMonthData(), loadDayTransactions(selectedDate)]);
    setRefreshing(false);
  };

  const monthTotal = Object.values(spendByDate).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth.format('YYYY-MM-DD')}
        onMonthChange={(month: DateData) => setCurrentMonth(dayjs(month.dateString))}
        dayComponent={({ date, state }: { date?: DateData; state?: string }) => (
          <DayCell
            date={date}
            state={state}
            amount={date ? spendByDate[date.dateString] ?? 0 : 0}
            isSelected={!!date && date.dateString === selectedDate}
            onPress={setSelectedDate}
          />
        )}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.textSecondary,
          monthTextColor: Colors.textPrimary,
          arrowColor: Colors.primary,
          indicatorColor: Colors.primary,
        }}
        style={styles.calendar}
      />

      <View style={styles.monthSummary}>
        <Text style={styles.monthSummaryLabel}>{currentMonth.format('MMMM YYYY')} total</Text>
        <Text style={styles.monthSummaryValue}>{formatCurrency(monthTotal)}</Text>
      </View>

      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Text style={styles.dayTitle}>{formatDate(selectedDate, 'DD MMMM YYYY')}</Text>
          {dayTotal > 0 && <Text style={styles.dayTotal}>{formatCurrency(dayTotal)} spent</Text>}
        </View>
        <TouchableOpacity
          style={styles.addForDay}
          onPress={() => router.push({ pathname: '/add-transaction', params: { date: selectedDate } })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addForDayText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dayTransactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.txList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item, index }) => (
          <View>
            <TransactionItem transaction={item} showDate />
            {index < dayTransactions.length - 1 && <View style={styles.divider} />}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No transactions"
            description="No expenses on this day. Tap Add to log one for this date."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 6,
  },

  dayCell: {
    width: 44,
    height: 46,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  dayNumWrap: {
    width: 28,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumSelected: { backgroundColor: Colors.primary },
  dayNum: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  dayNumToday: { color: Colors.primary, fontWeight: '800' },
  dayNumSelectedText: { color: '#fff', fontWeight: '700' },
  dayNumDisabled: { color: Colors.textDisabled },
  dayAmount: {
    fontSize: 9,
    color: Colors.expense,
    fontWeight: '600',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  dayAmountSelected: { color: Colors.primaryLight },

  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  monthSummaryLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  monthSummaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayHeaderLeft: { flex: 1, gap: 2 },
  dayTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  dayTotal: { fontSize: 14, fontWeight: '700', color: Colors.expense },
  addForDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: `${Colors.primary}55`,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addForDayText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  txList: { paddingHorizontal: 16, paddingBottom: 24 },
  divider: { height: 1, backgroundColor: Colors.border },
});
