import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { TransactionType } from '../types';
import { Colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

interface AmountDisplayProps {
  amount: number;
  transactionType: TransactionType;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  compact?: boolean;
}

const TYPE_COLORS: Record<TransactionType, string> = {
  expense: Colors.expense,
  income: Colors.income,
  transfer: Colors.transfer,
  cashback: Colors.cashback,
  reminder: Colors.textMuted,
  unknown: Colors.textSecondary,
};

const TYPE_PREFIX: Record<TransactionType, string> = {
  expense: '- ',
  income: '+ ',
  transfer: '',
  cashback: '+ ',
  reminder: '',
  unknown: '',
};

const FONT_SIZES = { sm: 13, md: 16, lg: 20, xl: 28 };

export function AmountDisplay({ amount, transactionType, style, size = 'md', compact }: AmountDisplayProps) {
  const color = TYPE_COLORS[transactionType] ?? Colors.textSecondary;
  const prefix = TYPE_PREFIX[transactionType] ?? '';
  const fontSize = FONT_SIZES[size];

  return (
    <Text style={[styles.text, { color, fontSize }, style]}>
      {prefix}{formatCurrency(amount, compact)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
