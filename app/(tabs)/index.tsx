import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { StatCard } from '../../src/components/StatCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { FAB } from '../../src/components/ui/FAB';
import { formatCurrency } from '../../src/utils/formatters';
import dayjs from 'dayjs';

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardStats, recentTransactions, reviewQueue } = useTransactionStore();
  const fetchDashboard = useTransactionStore((s) => s.fetchDashboardData);
  const fetchRecent = useTransactionStore((s) => s.fetchRecentTransactions);
  const fetchReview = useTransactionStore((s) => s.fetchReviewQueue);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchRecent();
    fetchReview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchRecent(), fetchReview()]);
    setRefreshing(false);
  };

  const { todaySpend, weekSpend, monthSpend, avgDailySpend, topCategory, topMerchant } =
    dashboardStats;

  return (
    <View style={styles.root}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Review Queue Banner */}
      {reviewQueue.length > 0 && (
        <TouchableOpacity
          style={styles.reviewBanner}
          onPress={() => router.push('/review-queue')}
          activeOpacity={0.8}
        >
          <Ionicons name="alert-circle" size={18} color={Colors.primary} />
          <Text style={styles.reviewText}>
            {reviewQueue.length} transaction{reviewQueue.length > 1 ? 's' : ''} need review
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Month Summary */}
      <View style={styles.monthHeader}>
        <Text style={styles.monthLabel}>{dayjs().format('MMMM YYYY')}</Text>
        <Text style={styles.monthAmount}>{formatCurrency(monthSpend)}</Text>
        <Text style={styles.monthSub}>Total this month</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Today"
          value={formatCurrency(todaySpend, true)}
          icon="today"
          iconColor={Colors.primary}
          style={styles.statHalf}
        />
        <StatCard
          label="This Week"
          value={formatCurrency(weekSpend, true)}
          icon="calendar"
          iconColor={Colors.info}
          style={styles.statHalf}
        />
        <StatCard
          label="Daily Avg"
          value={formatCurrency(avgDailySpend, true)}
          icon="trending-up"
          iconColor={Colors.warning}
          style={styles.statHalf}
        />
        <StatCard
          label="Top Category"
          value={topCategory ?? '—'}
          icon="pricetag"
          iconColor={Colors.success}
          style={styles.statHalf}
        />
      </View>

      {/* Top Merchant */}
      {topMerchant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Merchant This Month</Text>
          <TouchableOpacity
            style={styles.merchantChip}
            onPress={() => router.push('/merchant-insights')}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront" size={20} color={Colors.primary} />
            <Text style={styles.merchantName}>{topMerchant}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            description="Payment notifications will appear here automatically."
          />
        ) : (
          <View style={styles.txList}>
            {recentTransactions.map((tx, i) => (
              <View key={tx.id}>
                <TransactionItem transaction={tx} />
                {i < recentTransactions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/merchant-insights')}
          activeOpacity={0.7}
        >
          <Ionicons name="storefront-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionLabel}>Merchants</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/review-queue')}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
            {reviewQueue.length > 0 && <Badge label={`${reviewQueue.length}`} size="sm" style={styles.actionBadge} />}
          </View>
          <Text style={styles.actionLabel}>Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 20, paddingBottom: 96 },

  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.warningDim,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
    borderRadius: 12,
    padding: 14,
  },
  permText: { flex: 1, fontSize: 13, color: Colors.textPrimary },

  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    borderRadius: 12,
    padding: 14,
  },
  reviewText: { flex: 1, fontSize: 13, color: Colors.textPrimary },

  monthHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  monthAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  monthSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },

  merchantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  merchantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  txList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
  },
});
