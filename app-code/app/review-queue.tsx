import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/colors';
import { useTransactionStore } from '../src/stores/transactionStore';
import { TransactionItem } from '../src/components/TransactionItem';
import { EmptyState } from '../src/components/ui/EmptyState';
import { Card } from '../src/components/ui/Card';

export default function ReviewQueueScreen() {
  const { reviewQueue, fetchReviewQueue } = useTransactionStore();

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  return (
    <View style={styles.container}>
      {reviewQueue.length > 0 && (
        <Card style={styles.infoBox} padding={14}>
          <Text style={styles.infoText}>
            These transactions have a low confidence score. Please verify the details and approve or edit them.
          </Text>
        </Card>
      )}

      <FlatList
        data={reviewQueue}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View>
            <TransactionItem transaction={item} />
            {index < reviewQueue.length - 1 && <View style={styles.divider} />}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="All clear!"
            description="No transactions need review. All detections are high confidence."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  infoBox: { margin: 16, gap: 0 },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  divider: { height: 1, backgroundColor: Colors.border },
});
