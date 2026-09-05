import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CategoryBudgetProgress } from '../types';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { CategoryIcon } from './CategoryIcon';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { OVERALL_KEY } from '../stores/budgetStore';

interface BudgetCardProps {
  progress: CategoryBudgetProgress;
  onPress?: () => void;
}

export function BudgetCard({ progress, onPress }: BudgetCardProps) {
  const { category, limit, spent, remaining, percentage, carriedForward } = progress;
  const overBudget = percentage > 100;
  const nearLimit = percentage >= 80;
  const isOverall = category === OVERALL_KEY;
  const label = isOverall ? 'Overall' : category;

  const statusColor = overBudget ? Colors.error : nearLimit ? Colors.warning : Colors.success;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={!onPress}>
      <Card style={styles.card} padding={16}>
        <View style={styles.header}>
          <View style={styles.left}>
            {isOverall ? (
              <Ionicons name="wallet" size={18} color={Colors.primary} />
            ) : (
              <CategoryIcon category={category} size={18} />
            )}
            <Text style={styles.category}>{label}</Text>
            {carriedForward && (
              <View style={styles.carryBadge}>
                <Text style={styles.carryText}>carried</Text>
              </View>
            )}
          </View>
          <Text style={[styles.pct, { color: statusColor }]}>
            {formatPercentage(percentage, 0)}
          </Text>
        </View>

        <ProgressBar percentage={percentage} />

        <View style={styles.amounts}>
          <Text style={styles.spent}>
            {formatCurrency(spent, true)} spent
          </Text>
          <Text style={[styles.remaining, { color: overBudget ? Colors.error : Colors.textSecondary }]}>
            {overBudget
              ? `${formatCurrency(spent - limit, true)} over`
              : `${formatCurrency(remaining, true)} left`}
          </Text>
        </View>

        <Text style={styles.limit}>Limit: {formatCurrency(limit)}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  carryBadge: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  carryText: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  pct: {
    fontSize: 14,
    fontWeight: '700',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spent: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  remaining: {
    fontSize: 13,
    fontWeight: '500',
  },
  limit: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
