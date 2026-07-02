import { useEffect } from 'react';
import { useBudgetStore } from '../stores/budgetStore';

export function useBudget() {
  const {
    selectedMonth,
    overall,
    categoryProgress,
    isLoading,
    fetchBudgetProgress,
    setMonth,
    setBudget,
    clearBudget,
  } = useBudgetStore();

  useEffect(() => {
    fetchBudgetProgress();
  }, []);

  return {
    selectedMonth,
    overall,
    categoryProgress,
    isLoading,
    setMonth,
    setBudget,
    clearBudget,
    refresh: fetchBudgetProgress,
  };
}
