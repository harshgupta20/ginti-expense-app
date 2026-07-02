import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { AmountDisplay } from './AmountDisplay';
import { Badge } from './ui/Badge';
import { Colors } from '../constants/colors';
import { formatTime } from '../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
}

export function TransactionItem({ transaction: tx, onPress, showDate }: TransactionItemProps) {
  const router = useRouter();

  const handlePress = () => {
    onPress?.();
    router.push(`/transaction/${tx.id}`);
  };

  const displayName =
    tx.normalized_merchant_name || tx.merchant_name || 'Unknown Merchant';

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <CategoryIcon category={tx.category} size={20} />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {displayName}
          </Text>
          <AmountDisplay amount={tx.amount} transactionType={tx.transaction_type} size="md" />
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.meta}>
            {tx.category}
            {showDate ? '' : `  ·  ${formatTime(tx.transaction_timestamp)}`}
          </Text>
          {tx.needs_review === 1 && (
            <Badge label="Review" color={Colors.warning} size="sm" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchant: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
