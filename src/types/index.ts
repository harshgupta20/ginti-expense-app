export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'cashback'
  | 'reminder'
  | 'unknown';

// Categories are user-configurable (stored in the `categories` table); the built-in
// names below in constants/categories.ts seed the defaults and remain valid fallbacks.
export type Category = string;

// Source app / payment-source tags are user-configurable too.
export type SourceApp = string;

export type MemberRelation = 'self' | 'family' | 'friend';

export interface CategoryConfig {
  id: number;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  is_default: 0 | 1;
}

export interface PaymentSource {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  is_default: 0 | 1;
}

export interface Member {
  id: number;
  name: string;
  relation: MemberRelation;
  sort_order: number;
  is_default: 0 | 1;
}

export interface BudgetPeriod {
  id: number;
  month: string; // 'YYYY-MM'
  category: string | null; // null = overall budget
  limit_amount: number;
  created_at: string;
}

export interface RawNotification {
  id: number;
  package_name: string;
  notification_title: string;
  notification_body: string;
  received_at: string;
  processed: 0 | 1;
  parsing_version: string;
}

export interface Transaction {
  id: number;
  amount: number;
  merchant_name: string;
  normalized_merchant_name: string;
  category: Category;
  source_app: SourceApp;
  transaction_type: TransactionType;
  confidence_score: number;
  raw_notification_id: number | null;
  transaction_timestamp: string;
  created_at: string;
  needs_review: 0 | 1;
  payment_source: string | null;
  paid_by_member_id: number | null;
  note: string | null;
  subscription_id: number | null;
}

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: number;
  name: string;
  amount: number; // amount as entered (per cycle)
  billing_cycle: BillingCycle;
  category: string;
  payment_source: string | null;
  paid_by_member_id: number | null;
  // For monthly/yearly this is the anchor day 1–28. Unused for daily; for weekly
  // the recurrence is anchored to the subscription's start date (see created_at).
  day_of_month: number;
  start_month: string; // 'YYYY-MM'
  active: 0 | 1;
  created_at: string;
}

export interface MerchantAlias {
  id: number;
  original_name: string;
  normalized_name: string;
}

export interface ParserFeedback {
  id: number;
  raw_notification_id: number;
  corrected_merchant: string | null;
  corrected_category: Category | null;
  corrected_amount: number | null;
  created_at: string;
}

export interface Budget {
  id: number;
  category: Category;
  monthly_limit: number;
}

export interface ParseResult {
  amount: number | null;
  merchant: string | null;
  category: Category;
  transactionType: TransactionType;
  confidence: number;
  normalizedMerchant?: string;
}

export interface NotificationPayload {
  id: string;
  packageName: string;
  title: string;
  body: string;
  timestamp: number;
}

export interface DashboardStats {
  todaySpend: number;
  weekSpend: number;
  monthSpend: number;
  avgDailySpend: number;
  topCategory: Category | null;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  count: number;
  percentage: number;
}

export interface MerchantStat {
  merchant: string;
  totalSpend: number;
  transactionCount: number;
  avgSpend: number;
  lastDate: string;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

// Month-aware budget progress used by the redesigned Budgets screen.
export interface CategoryBudgetProgress {
  category: string; // category name, or '__overall__' for the overall budget
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  carriedForward: boolean; // limit inherited from a prior month (no explicit row this month)
  periodId: number | null; // id of the explicit budget_periods row, if any
}

export interface BudgetMonthSummary {
  month: string; // 'YYYY-MM'
  totalBudget: number; // overall budget if set, else sum of category budgets
  spent: number;
}

export interface WeeklyData {
  date: string;
  amount: number;
  label: string;
}

export interface PaymentSourceStat {
  source: string;
  amount: number;
  count: number;
}

export interface WeekdaySpend {
  weekday: number; // 0 = Sunday … 6 = Saturday
  amount: number;
  count: number;
}

// Aggregate money movement for an analytics period.
export interface PeriodTotals {
  expense: number;
  income: number;
  transfer: number;
  count: number; // number of expense transactions
  avgExpense: number;
  biggestExpense: { amount: number; name: string; date: string } | null;
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface SubscriptionDetection {
  merchant: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  lastDate: string;
  nextExpectedDate: string;
  transactionCount: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingTransactionId?: number;
  confidence: number;
}

export interface TransactionFilters {
  category?: Category;
  merchant?: string;
  sourceApp?: SourceApp;
  startDate?: string;
  endDate?: string;
  transactionType?: TransactionType;
  searchQuery?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
