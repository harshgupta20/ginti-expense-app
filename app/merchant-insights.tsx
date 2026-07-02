import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { useMerchantStore } from '../src/stores/merchantStore';
import { Card } from '../src/components/ui/Card';
import { EmptyState } from '../src/components/ui/EmptyState';
import { LoadingSpinner } from '../src/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../src/utils/formatters';
import { detectSubscriptions } from '../src/services/subscriptionDetector';
import { SubscriptionDetection } from '../src/types';
import dayjs from 'dayjs';

export default function MerchantInsightsScreen() {
  const { topMerchants, isLoading, fetchTopMerchants } = useMerchantStore();
  const [search, setSearch] = useState('');
  const [subscriptions, setSubscriptions] = useState<SubscriptionDetection[]>([]);
  const [activeTab, setActiveTab] = useState<'merchants' | 'subscriptions'>('merchants');

  useEffect(() => {
    fetchTopMerchants();
    detectSubscriptions().then(setSubscriptions);
  }, []);

  const filtered = topMerchants.filter((m) =>
    m.merchant.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['merchants', 'subscriptions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'merchants' ? 'Top Merchants' : `Subscriptions (${subscriptions.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'merchants' ? (
        <>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search merchants..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.merchant}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <Card style={styles.merchantCard} padding={14}>
                <View style={styles.merchantHeader}>
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.merchantName} numberOfLines={1}>{item.merchant}</Text>
                  <Text style={styles.merchantTotal}>{formatCurrency(item.totalSpend, true)}</Text>
                </View>
                <View style={styles.merchantStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Transactions</Text>
                    <Text style={styles.statValue}>{item.transactionCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Avg Spend</Text>
                    <Text style={styles.statValue}>{formatCurrency(item.avgSpend, true)}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Last</Text>
                    <Text style={styles.statValue}>{formatDate(item.lastDate, 'DD MMM')}</Text>
                  </View>
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <EmptyState icon="storefront-outline" title="No merchants yet" />
            }
          />
        </>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.merchant}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.subCard} padding={16}>
              <View style={styles.subHeader}>
                <View>
                  <Text style={styles.merchantName}>{item.merchant}</Text>
                  <Text style={styles.subFrequency}>
                    {item.frequency === 'monthly' ? 'Monthly' : 'Yearly'} · {formatCurrency(item.amount)}
                  </Text>
                </View>
                <View style={styles.subBadge}>
                  <Ionicons name="refresh-circle" size={20} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.subDates}>
                <View style={styles.subDate}>
                  <Text style={styles.subDateLabel}>Last Payment</Text>
                  <Text style={styles.subDateValue}>{formatDate(item.lastDate, 'DD MMM YYYY')}</Text>
                </View>
                <View style={styles.subDate}>
                  <Text style={styles.subDateLabel}>Next Expected</Text>
                  <Text style={[styles.subDateValue, { color: Colors.primary }]}>
                    {formatDate(item.nextExpectedDate, 'DD MMM YYYY')}
                  </Text>
                </View>
              </View>
              <Text style={styles.subCount}>{item.transactionCount} payments detected</Text>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="refresh-circle-outline"
              title="No subscriptions detected"
              description="Recurring monthly payments will be automatically detected here."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  merchantCard: { gap: 10 },
  merchantHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  merchantName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  merchantTotal: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  merchantStats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  statValue: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  subCard: { gap: 12 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subFrequency: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  subBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subDates: { flexDirection: 'row', justifyContent: 'space-between' },
  subDate: { gap: 2 },
  subDateLabel: { fontSize: 11, color: Colors.textMuted },
  subDateValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  subCount: { fontSize: 11, color: Colors.textMuted },
});
