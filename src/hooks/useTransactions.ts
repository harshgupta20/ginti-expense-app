import { useCallback } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { TransactionFilters } from '../types';

export function useTransactions() {
  const {
    transactions,
    totalCount,
    hasMore,
    isLoading,
    filters,
    fetchTransactions,
    setFilters,
    clearFilters,
  } = useTransactionStore();

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchTransactions(false);
    }
  }, [hasMore, isLoading, fetchTransactions]);

  const refresh = useCallback(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  const applyFilters = useCallback(
    (newFilters: TransactionFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  return {
    transactions,
    totalCount,
    hasMore,
    isLoading,
    filters,
    loadMore,
    refresh,
    applyFilters,
    clearFilters,
  };
}
