import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useTransactions } from '../../src/hooks/useTransactions';
import { TransactionItem } from '../../src/components/TransactionItem';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { FAB } from '../../src/components/ui/FAB';
import { useConfigStore } from '../../src/stores/configStore';
import { Transaction, Category, SourceApp } from '../../src/types';
import { groupTransactionsByDate } from '../../src/utils/formatters';

export default function HistoryScreen() {
  const { transactions, totalCount, hasMore, isLoading, filters, loadMore, refresh, applyFilters, clearFilters } =
    useTransactions();
  // Select stable array references; deriving names inside the selector would return
  // a new array each render and cause an infinite re-render loop (Zustand v5).
  const categories = useConfigStore((s) => s.categories);
  const paymentSources = useConfigStore((s) => s.paymentSources);
  const categoryNames = categories.map((c) => c.name);
  const sourceNames = paymentSources.map((p) => p.name);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedSource, setSelectedSource] = useState<SourceApp | undefined>();

  useEffect(() => {
    refresh();
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      applyFilters({ ...filters, searchQuery: text || undefined });
    },
    [filters, applyFilters]
  );

  const applyFilterModal = () => {
    applyFilters({
      ...filters,
      category: selectedCategory,
      sourceApp: selectedSource,
      searchQuery: searchQuery || undefined,
    });
    setFilterVisible(false);
  };

  const resetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedSource(undefined);
    setSearchQuery('');
    clearFilters();
    setFilterVisible(false);
  };

  const activeFiltersCount = [selectedCategory, selectedSource].filter(Boolean).length;

  const grouped = groupTransactionsByDate(transactions);

  const renderGroup = ({ item }: { item: { label: string; items: Transaction[] } }) => (
    <View style={styles.group}>
      <Text style={styles.dateLabel}>{item.label}</Text>
      <View style={styles.groupItems}>
        {item.items.map((tx, i) => (
          <View key={tx.id}>
            <TransactionItem transaction={tx} showDate />
            {i < item.items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchants..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={18} color={activeFiltersCount > 0 ? Colors.primary : Colors.textSecondary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.countText}>
        {totalCount} transaction{totalCount !== 1 ? 's' : ''}
      </Text>

      {/* Transaction List */}
      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={renderGroup}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshing={isLoading && transactions.length === 0}
        onRefresh={refresh}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions"
              description="Your expense history will appear here."
            />
          ) : null
        }
        ListFooterComponent={
          hasMore && isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterVisible(false)} activeOpacity={1}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHandle} />
            <Text style={styles.filterTitle}>Filter Transactions</Text>

            <Text style={styles.filterSectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {categoryNames.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                  onPress={() => setSelectedCategory(selectedCategory === cat ? undefined : cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionLabel}>Payment Source</Text>
            <View style={styles.sourceRow}>
              {sourceNames.map((app) => (
                <TouchableOpacity
                  key={app}
                  style={[styles.chip, selectedSource === app && styles.chipSelected]}
                  onPress={() => setSelectedSource(selectedSource === app ? undefined : app)}
                >
                  <Text style={[styles.chipText, selectedSource === app && styles.chipTextSelected]}>
                    {app}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <Button label="Reset" onPress={resetFilters} variant="ghost" style={{ flex: 1 }} />
              <Button label="Apply" onPress={applyFilterModal} style={{ flex: 2 }} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { borderColor: Colors.primary },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  countText: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 96, gap: 20 },

  group: { gap: 8 },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupItems: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  divider: { height: 1, backgroundColor: Colors.border },
  loader: { padding: 16 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  filterHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { flexGrow: 0 },
  sourceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 4,
  },
  chipSelected: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: Colors.primary },
  filterActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
