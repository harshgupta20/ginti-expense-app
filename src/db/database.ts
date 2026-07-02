import * as SQLite from 'expo-sqlite';
import {
  CREATE_RAW_NOTIFICATIONS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_MERCHANT_ALIASES_TABLE,
  CREATE_PARSER_FEEDBACK_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_PAYMENT_SOURCES_TABLE,
  CREATE_MEMBERS_TABLE,
  CREATE_BUDGET_PERIODS_TABLE,
  CREATE_BUDGET_PERIODS_INDEX,
  CREATE_SUBSCRIPTIONS_TABLE,
  CREATE_INDEXES,
  DEFAULT_MERCHANT_ALIASES,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_SOURCES,
  DEFAULT_MEMBERS,
} from './schema';
import {
  RawNotification,
  Transaction,
  MerchantAlias,
  Budget,
  BudgetPeriod,
  CategoryConfig,
  PaymentSource,
  Member,
  MemberRelation,
  Subscription,
  BillingCycle,
  ParserFeedback,
  TransactionFilters,
  Category,
  SourceApp,
} from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('tracker.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(CREATE_RAW_NOTIFICATIONS_TABLE);
  await database.execAsync(CREATE_TRANSACTIONS_TABLE);
  await database.execAsync(CREATE_MERCHANT_ALIASES_TABLE);
  await database.execAsync(CREATE_PARSER_FEEDBACK_TABLE);
  await database.execAsync(CREATE_BUDGETS_TABLE);
  await database.execAsync(CREATE_CATEGORIES_TABLE);
  await database.execAsync(CREATE_PAYMENT_SOURCES_TABLE);
  await database.execAsync(CREATE_MEMBERS_TABLE);
  await database.execAsync(CREATE_BUDGET_PERIODS_TABLE);
  await database.execAsync(CREATE_BUDGET_PERIODS_INDEX);
  await database.execAsync(CREATE_SUBSCRIPTIONS_TABLE);

  for (const idx of CREATE_INDEXES) {
    await database.execAsync(idx);
  }

  await runMigrations(database);
  await seedDefaultMerchantAliases(database);
  await seedDefaultCategories(database);
  await seedDefaultPaymentSources(database);
  await seedDefaultMembers(database);
  await migrateLegacyBudgets(database);
}

/**
 * Idempotent column migrations for existing installs. SQLite has no
 * "ADD COLUMN IF NOT EXISTS", so we inspect PRAGMA table_info first.
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const cols = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(transactions)'
  );
  const existing = new Set(cols.map((c) => c.name));
  const additions: [string, string][] = [
    ['payment_source', 'TEXT'],
    ['paid_by_member_id', 'INTEGER'],
    ['note', 'TEXT'],
    ['subscription_id', 'INTEGER'],
  ];
  for (const [name, type] of additions) {
    if (!existing.has(name)) {
      await database.execAsync(`ALTER TABLE transactions ADD COLUMN ${name} ${type}`);
    }
  }
}

async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );
  if (count && count.count > 0) return;
  let order = 0;
  for (const [name, color, icon] of DEFAULT_CATEGORIES) {
    await database.runAsync(
      'INSERT OR IGNORE INTO categories (name, color, icon, sort_order, is_default) VALUES (?, ?, ?, ?, 1)',
      [name, color, icon, order++]
    );
  }
}

async function seedDefaultPaymentSources(database: SQLite.SQLiteDatabase): Promise<void> {
  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM payment_sources'
  );
  if (count && count.count > 0) return;
  let order = 0;
  for (const [name, icon] of DEFAULT_PAYMENT_SOURCES) {
    await database.runAsync(
      'INSERT OR IGNORE INTO payment_sources (name, icon, sort_order, is_default) VALUES (?, ?, ?, 1)',
      [name, icon, order++]
    );
  }
}

async function seedDefaultMembers(database: SQLite.SQLiteDatabase): Promise<void> {
  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM members'
  );
  if (count && count.count > 0) return;
  let order = 0;
  for (const [name, relation] of DEFAULT_MEMBERS) {
    await database.runAsync(
      'INSERT OR IGNORE INTO members (name, relation, sort_order, is_default) VALUES (?, ?, ?, 1)',
      [name, relation, order++]
    );
  }
}

/**
 * One-time migration of the legacy single-row-per-category `budgets` table into
 * month-aware `budget_periods` for the current month. Safe to run repeatedly.
 */
async function migrateLegacyBudgets(database: SQLite.SQLiteDatabase): Promise<void> {
  const periodCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM budget_periods'
  );
  if (periodCount && periodCount.count > 0) return;

  const legacy = await database.getAllAsync<Budget>('SELECT * FROM budgets');
  if (legacy.length === 0) return;

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const now = new Date().toISOString();
  for (const b of legacy) {
    await database.runAsync(
      'INSERT OR IGNORE INTO budget_periods (month, category, limit_amount, created_at) VALUES (?, ?, ?, ?)',
      [month, b.category, b.monthly_limit, now]
    );
  }
}

async function seedDefaultMerchantAliases(database: SQLite.SQLiteDatabase): Promise<void> {
  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM merchant_aliases'
  );
  if (count && count.count > 0) return;

  for (const [original, normalized] of DEFAULT_MERCHANT_ALIASES) {
    await database.runAsync(
      'INSERT OR IGNORE INTO merchant_aliases (original_name, normalized_name) VALUES (?, ?)',
      [original, normalized]
    );
  }
}

// ─── Raw Notifications ───────────────────────────────────────────────────────

export async function insertRawNotification(
  packageName: string,
  title: string,
  body: string,
  receivedAt: string,
  parsingVersion: string
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO raw_notifications (package_name, notification_title, notification_body, received_at, processed, parsing_version)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [packageName, title, body, receivedAt, parsingVersion]
  );
  return result.lastInsertRowId;
}

export async function markNotificationProcessed(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE raw_notifications SET processed = 1 WHERE id = ?',
    [id]
  );
}

export async function getUnprocessedNotifications(): Promise<RawNotification[]> {
  const database = await getDatabase();
  return database.getAllAsync<RawNotification>(
    'SELECT * FROM raw_notifications WHERE processed = 0 ORDER BY received_at ASC'
  );
}

export async function getAllRawNotifications(): Promise<RawNotification[]> {
  const database = await getDatabase();
  return database.getAllAsync<RawNotification>(
    'SELECT * FROM raw_notifications ORDER BY received_at DESC'
  );
}

export async function resetAllNotificationsForReprocessing(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('UPDATE raw_notifications SET processed = 0');
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function insertTransaction(
  tx: Omit<Transaction, 'id' | 'created_at' | 'payment_source' | 'paid_by_member_id' | 'note' | 'subscription_id'> &
    Partial<Pick<Transaction, 'payment_source' | 'paid_by_member_id' | 'note' | 'subscription_id'>>
): Promise<number> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO transactions
      (amount, merchant_name, normalized_merchant_name, category, source_app, transaction_type,
       confidence_score, raw_notification_id, transaction_timestamp, created_at, needs_review,
       payment_source, paid_by_member_id, note, subscription_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tx.amount,
      tx.merchant_name,
      tx.normalized_merchant_name,
      tx.category,
      tx.source_app,
      tx.transaction_type,
      tx.confidence_score,
      tx.raw_notification_id,
      tx.transaction_timestamp,
      now,
      tx.needs_review,
      tx.payment_source ?? null,
      tx.paid_by_member_id ?? null,
      tx.note ?? null,
      tx.subscription_id ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(
  id: number,
  updates: Partial<Pick<Transaction, 'amount' | 'merchant_name' | 'normalized_merchant_name' | 'category' | 'needs_review'>>
): Promise<void> {
  const database = await getDatabase();
  const fields = Object.keys(updates)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];
  await database.runAsync(`UPDATE transactions SET ${fields} WHERE id = ?`, values);
}

export async function deleteTransaction(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
}

export async function getTransactions(
  filters: TransactionFilters = {},
  page = 0,
  pageSize = 30
): Promise<{ data: Transaction[]; total: number }> {
  const database = await getDatabase();

  const conditions: string[] = ['transaction_type != ?'];
  const params: (string | number)[] = ['reminder'];

  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  if (filters.sourceApp) {
    conditions.push('source_app = ?');
    params.push(filters.sourceApp);
  }
  if (filters.transactionType) {
    conditions.push('transaction_type = ?');
    params.push(filters.transactionType);
  }
  if (filters.startDate) {
    conditions.push('transaction_timestamp >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('transaction_timestamp <= ?');
    params.push(filters.endDate);
  }
  if (filters.searchQuery) {
    conditions.push('(normalized_merchant_name LIKE ? OR merchant_name LIKE ?)');
    params.push(`%${filters.searchQuery}%`, `%${filters.searchQuery}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM transactions ${where}`,
    params
  );

  const data = await database.getAllAsync<Transaction>(
    `SELECT * FROM transactions ${where}
     ORDER BY transaction_timestamp DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, page * pageSize]
  );

  return { data, total: countResult?.count ?? 0 };
}

export async function getTransactionsNeedingReview(): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE needs_review = 1 ORDER BY created_at DESC'
  );
}

export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE transaction_type != 'reminder'
     ORDER BY transaction_timestamp DESC LIMIT ?`,
    [limit]
  );
}

export async function getTransactionsByDateRange(
  start: string,
  end: string
): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE transaction_timestamp >= ? AND transaction_timestamp <= ?
     AND transaction_type != 'reminder'
     ORDER BY transaction_timestamp ASC`,
    [start, end]
  );
}

export async function getSpendByDateRange(start: string, end: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE transaction_timestamp >= ? AND transaction_timestamp <= ?
     AND transaction_type = 'expense'`,
    [start, end]
  );
  return result?.total ?? 0;
}

export async function getCategoryBreakdown(
  start: string,
  end: string
): Promise<{ category: Category; amount: number; count: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync<{ category: Category; amount: number; count: number }>(
    `SELECT category, SUM(amount) as amount, COUNT(*) as count FROM transactions
     WHERE transaction_timestamp >= ? AND transaction_timestamp <= ?
     AND transaction_type = 'expense'
     GROUP BY category ORDER BY amount DESC`,
    [start, end]
  );
}

export async function getTopMerchants(
  start: string,
  end: string,
  limit = 10
): Promise<{ merchant: string; total: number; count: number; last_date: string }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT normalized_merchant_name as merchant, SUM(amount) as total,
            COUNT(*) as count, MAX(transaction_timestamp) as last_date
     FROM transactions
     WHERE transaction_timestamp >= ? AND transaction_timestamp <= ?
     AND transaction_type = 'expense'
     AND normalized_merchant_name != ''
     GROUP BY normalized_merchant_name
     ORDER BY total DESC LIMIT ?`,
    [start, end, limit]
  );
}

export async function getDailySpend(
  start: string,
  end: string
): Promise<{ date: string; amount: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT DATE(transaction_timestamp) as date, SUM(amount) as amount
     FROM transactions
     WHERE transaction_timestamp >= ? AND transaction_timestamp <= ?
     AND transaction_type = 'expense'
     GROUP BY DATE(transaction_timestamp)
     ORDER BY date ASC`,
    [start, end]
  );
}

export async function getMonthlySpend(): Promise<{ month: string; amount: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    `SELECT strftime('%Y-%m', transaction_timestamp) as month, SUM(amount) as amount
     FROM transactions
     WHERE transaction_type = 'expense'
     GROUP BY month ORDER BY month ASC LIMIT 12`
  );
}

export async function getMerchantStats(
  merchantName: string
): Promise<{ total: number; count: number; avg: number; last_date: string } | null> {
  const database = await getDatabase();
  return database.getFirstAsync(
    `SELECT SUM(amount) as total, COUNT(*) as count,
            AVG(amount) as avg, MAX(transaction_timestamp) as last_date
     FROM transactions
     WHERE normalized_merchant_name = ? AND transaction_type = 'expense'`,
    [merchantName]
  );
}

export async function getNearDuplicates(
  amount: number,
  timestamp: string,
  windowSeconds = 300
): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE amount = ?
     AND ABS(strftime('%s', transaction_timestamp) - strftime('%s', ?)) <= ?
     ORDER BY transaction_timestamp DESC LIMIT 5`,
    [amount, timestamp, windowSeconds]
  );
}

export async function getAllTransactionsForMerchant(merchant: string): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE normalized_merchant_name = ?
     AND transaction_type = 'expense'
     ORDER BY transaction_timestamp DESC`,
    [merchant]
  );
}

// ─── Merchant Aliases ─────────────────────────────────────────────────────────

export async function getAllMerchantAliases(): Promise<MerchantAlias[]> {
  const database = await getDatabase();
  return database.getAllAsync<MerchantAlias>(
    'SELECT * FROM merchant_aliases ORDER BY normalized_name ASC'
  );
}

export async function getMerchantAlias(originalName: string): Promise<string | null> {
  const database = await getDatabase();
  const upperName = originalName.toUpperCase().trim();
  const result = await database.getFirstAsync<{ normalized_name: string }>(
    'SELECT normalized_name FROM merchant_aliases WHERE UPPER(original_name) = ?',
    [upperName]
  );
  return result?.normalized_name ?? null;
}

export async function upsertMerchantAlias(
  originalName: string,
  normalizedName: string
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO merchant_aliases (original_name, normalized_name) VALUES (?, ?)',
    [originalName.toUpperCase().trim(), normalizedName]
  );
}

export async function deleteMerchantAlias(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM merchant_aliases WHERE id = ?', [id]);
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function getAllBudgets(): Promise<Budget[]> {
  const database = await getDatabase();
  return database.getAllAsync<Budget>('SELECT * FROM budgets ORDER BY category ASC');
}

export async function upsertBudget(category: Category, monthlyLimit: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO budgets (category, monthly_limit) VALUES (?, ?)',
    [category, monthlyLimit]
  );
}

export async function deleteBudget(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
}

// ─── Budget Periods (month-aware) ───────────────────────────────────────────────

export async function getBudgetPeriodsForMonth(month: string): Promise<BudgetPeriod[]> {
  const database = await getDatabase();
  return database.getAllAsync<BudgetPeriod>(
    'SELECT * FROM budget_periods WHERE month = ?',
    [month]
  );
}

/**
 * Returns the effective budget rows for a month, carrying forward the most recent
 * prior month's value for any category (or the overall budget) that has no explicit
 * row in the requested month. `carried` flags inherited values.
 */
export async function getEffectiveBudgets(
  month: string
): Promise<{ category: string | null; limit_amount: number; periodId: number | null; carried: boolean }[]> {
  const database = await getDatabase();
  // All rows up to and including the requested month, newest first.
  const rows = await database.getAllAsync<BudgetPeriod>(
    'SELECT * FROM budget_periods WHERE month <= ? ORDER BY month DESC',
    [month]
  );
  const seen = new Map<string, { category: string | null; limit_amount: number; periodId: number | null; carried: boolean }>();
  for (const r of rows) {
    const key = r.category ?? '__overall__';
    if (seen.has(key)) continue; // first (newest) wins
    seen.set(key, {
      category: r.category,
      limit_amount: r.limit_amount,
      periodId: r.month === month ? r.id : null,
      carried: r.month !== month,
    });
  }
  return Array.from(seen.values());
}

export async function upsertBudgetPeriod(
  month: string,
  category: string | null,
  limit: number
): Promise<void> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT id FROM budget_periods WHERE month = ? AND IFNULL(category, ?) = IFNULL(?, ?)',
    [month, '__overall__', category, '__overall__']
  );
  if (existing) {
    await database.runAsync(
      'UPDATE budget_periods SET limit_amount = ? WHERE id = ?',
      [limit, existing.id]
    );
  } else {
    await database.runAsync(
      'INSERT INTO budget_periods (month, category, limit_amount, created_at) VALUES (?, ?, ?, ?)',
      [month, category, limit, new Date().toISOString()]
    );
  }
}

export async function deleteBudgetPeriod(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM budget_periods WHERE id = ?', [id]);
}

export async function getBudgetMonths(): Promise<string[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ month: string }>(
    'SELECT DISTINCT month FROM budget_periods ORDER BY month DESC'
  );
  return rows.map((r) => r.month);
}

// ─── Categories ─────────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<CategoryConfig[]> {
  const database = await getDatabase();
  return database.getAllAsync<CategoryConfig>(
    'SELECT * FROM categories ORDER BY sort_order ASC, name ASC'
  );
}

export async function insertCategory(
  name: string,
  color: string,
  icon: string
): Promise<number> {
  const database = await getDatabase();
  const max = await database.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(sort_order), 0) as m FROM categories'
  );
  const result = await database.runAsync(
    'INSERT INTO categories (name, color, icon, sort_order, is_default) VALUES (?, ?, ?, ?, 0)',
    [name.trim(), color, icon, (max?.m ?? 0) + 1]
  );
  return result.lastInsertRowId;
}

export async function updateCategory(
  id: number,
  updates: Partial<Pick<CategoryConfig, 'name' | 'color' | 'icon'>>
): Promise<void> {
  const database = await getDatabase();
  // Renaming a category should keep existing transactions in sync.
  if (updates.name) {
    const current = await database.getFirstAsync<{ name: string }>(
      'SELECT name FROM categories WHERE id = ?',
      [id]
    );
    if (current && current.name !== updates.name.trim()) {
      await database.runAsync('UPDATE transactions SET category = ? WHERE category = ?', [
        updates.name.trim(),
        current.name,
      ]);
    }
  }
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates).map((v) => (typeof v === 'string' ? v.trim() : v)), id];
  await database.runAsync(`UPDATE categories SET ${fields} WHERE id = ?`, values);
}

export async function deleteCategory(id: number): Promise<void> {
  const database = await getDatabase();
  // Reassign affected transactions to 'Others' so nothing is orphaned.
  const current = await database.getFirstAsync<{ name: string }>(
    'SELECT name FROM categories WHERE id = ?',
    [id]
  );
  if (current) {
    await database.runAsync(
      "UPDATE transactions SET category = 'Others' WHERE category = ?",
      [current.name]
    );
  }
  await database.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

// ─── Payment Sources ────────────────────────────────────────────────────────────

export async function getAllPaymentSources(): Promise<PaymentSource[]> {
  const database = await getDatabase();
  return database.getAllAsync<PaymentSource>(
    'SELECT * FROM payment_sources ORDER BY sort_order ASC, name ASC'
  );
}

export async function insertPaymentSource(name: string, icon: string): Promise<number> {
  const database = await getDatabase();
  const max = await database.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(sort_order), 0) as m FROM payment_sources'
  );
  const result = await database.runAsync(
    'INSERT INTO payment_sources (name, icon, sort_order, is_default) VALUES (?, ?, ?, 0)',
    [name.trim(), icon, (max?.m ?? 0) + 1]
  );
  return result.lastInsertRowId;
}

export async function updatePaymentSource(
  id: number,
  updates: Partial<Pick<PaymentSource, 'name' | 'icon'>>
): Promise<void> {
  const database = await getDatabase();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates).map((v) => (typeof v === 'string' ? v.trim() : v)), id];
  await database.runAsync(`UPDATE payment_sources SET ${fields} WHERE id = ?`, values);
}

export async function deletePaymentSource(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM payment_sources WHERE id = ?', [id]);
}

// ─── Members (Paid by) ──────────────────────────────────────────────────────────

export async function getAllMembers(): Promise<Member[]> {
  const database = await getDatabase();
  return database.getAllAsync<Member>(
    'SELECT * FROM members ORDER BY sort_order ASC, name ASC'
  );
}

export async function insertMember(name: string, relation: MemberRelation): Promise<number> {
  const database = await getDatabase();
  const max = await database.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(sort_order), 0) as m FROM members'
  );
  const result = await database.runAsync(
    'INSERT INTO members (name, relation, sort_order, is_default) VALUES (?, ?, ?, 0)',
    [name.trim(), relation, (max?.m ?? 0) + 1]
  );
  return result.lastInsertRowId;
}

export async function updateMember(
  id: number,
  updates: Partial<Pick<Member, 'name' | 'relation'>>
): Promise<void> {
  const database = await getDatabase();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates).map((v) => (typeof v === 'string' ? v.trim() : v)), id];
  await database.runAsync(`UPDATE members SET ${fields} WHERE id = ?`, values);
}

export async function deleteMember(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE transactions SET paid_by_member_id = NULL WHERE paid_by_member_id = ?', [id]);
  await database.runAsync('DELETE FROM members WHERE id = ?', [id]);
}

// ─── Parser Feedback ──────────────────────────────────────────────────────────

export async function insertParserFeedback(
  rawNotificationId: number | null,
  transactionId: number,
  correctedMerchant: string | null,
  correctedCategory: Category | null,
  correctedAmount: number | null
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO parser_feedback
      (raw_notification_id, transaction_id, corrected_merchant, corrected_category, corrected_amount, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [rawNotificationId, transactionId, correctedMerchant, correctedCategory, correctedAmount, new Date().toISOString()]
  );
}

// ─── Subscriptions ──────────────────────────────────────────────────────────────

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const database = await getDatabase();
  return database.getAllAsync<Subscription>(
    'SELECT * FROM subscriptions ORDER BY active DESC, name ASC'
  );
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  const database = await getDatabase();
  return database.getAllAsync<Subscription>('SELECT * FROM subscriptions WHERE active = 1');
}

export async function insertSubscription(
  sub: Omit<Subscription, 'id' | 'created_at'>
): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO subscriptions
      (name, amount, billing_cycle, category, payment_source, paid_by_member_id, day_of_month, start_month, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sub.name,
      sub.amount,
      sub.billing_cycle,
      sub.category,
      sub.payment_source ?? null,
      sub.paid_by_member_id ?? null,
      sub.day_of_month,
      sub.start_month,
      sub.active,
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowId;
}

export async function updateSubscription(
  id: number,
  updates: Partial<Pick<Subscription, 'name' | 'amount' | 'billing_cycle' | 'category' | 'payment_source' | 'paid_by_member_id' | 'day_of_month' | 'active'>>
): Promise<void> {
  const database = await getDatabase();
  const fields = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  await database.runAsync(`UPDATE subscriptions SET ${fields} WHERE id = ?`, [
    ...Object.values(updates),
    id,
  ]);
}

export async function deleteSubscription(id: number): Promise<void> {
  const database = await getDatabase();
  // Unlink generated charges but keep the historical transactions.
  await database.runAsync('UPDATE transactions SET subscription_id = NULL WHERE subscription_id = ?', [id]);
  await database.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}

/** Months ('YYYY-MM') for which a subscription has already generated a charge. */
export async function getSubscriptionChargedMonths(subId: number): Promise<Set<string>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ m: string }>(
    `SELECT DISTINCT strftime('%Y-%m', transaction_timestamp) as m
     FROM transactions WHERE subscription_id = ?`,
    [subId]
  );
  return new Set(rows.map((r) => r.m));
}

// ─── Backup (full export / import) ───────────────────────────────────────────────

export interface BackupData {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  categories: CategoryConfig[];
  payment_sources: PaymentSource[];
  members: Member[];
  budget_periods: BudgetPeriod[];
  merchant_aliases: MerchantAlias[];
  subscriptions: Subscription[];
}

export async function exportAllData(): Promise<BackupData> {
  const database = await getDatabase();
  const [transactions, categories, payment_sources, members, budget_periods, merchant_aliases, subscriptions] =
    await Promise.all([
      database.getAllAsync<Transaction>('SELECT * FROM transactions'),
      database.getAllAsync<CategoryConfig>('SELECT * FROM categories'),
      database.getAllAsync<PaymentSource>('SELECT * FROM payment_sources'),
      database.getAllAsync<Member>('SELECT * FROM members'),
      database.getAllAsync<BudgetPeriod>('SELECT * FROM budget_periods'),
      database.getAllAsync<MerchantAlias>('SELECT * FROM merchant_aliases'),
      database.getAllAsync<Subscription>('SELECT * FROM subscriptions'),
    ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    payment_sources,
    members,
    budget_periods,
    merchant_aliases,
    subscriptions,
  };
}

/** Replaces all app data with the contents of a backup. */
export async function importAllData(data: BackupData): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    const tables = ['transactions', 'categories', 'payment_sources', 'members', 'budget_periods', 'merchant_aliases', 'subscriptions'];
    for (const t of tables) await database.runAsync(`DELETE FROM ${t}`);

    const insertRows = async (table: string, rows: any[]) => {
      for (const row of rows) {
        const cols = Object.keys(row);
        if (cols.length === 0) continue;
        const placeholders = cols.map(() => '?').join(', ');
        await database.runAsync(
          `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
          cols.map((c) => row[c] as any)
        );
      }
    };

    await insertRows('categories', data.categories ?? []);
    await insertRows('payment_sources', data.payment_sources ?? []);
    await insertRows('members', data.members ?? []);
    await insertRows('merchant_aliases', data.merchant_aliases ?? []);
    await insertRows('subscriptions', data.subscriptions ?? []);
    await insertRows('budget_periods', data.budget_periods ?? []);
    await insertRows('transactions', data.transactions ?? []);
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('DELETE FROM parser_feedback');
  await database.execAsync('DELETE FROM transactions');
  await database.execAsync('DELETE FROM raw_notifications');
}

export async function getAllTransactionsForExport(): Promise<Transaction[]> {
  const database = await getDatabase();
  return database.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE transaction_type != 'reminder'
     ORDER BY transaction_timestamp DESC`
  );
}

export async function getUniqueMerchants(): Promise<string[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ merchant: string }>(
    `SELECT DISTINCT normalized_merchant_name as merchant FROM transactions
     WHERE normalized_merchant_name != '' AND transaction_type = 'expense'
     ORDER BY merchant ASC`
  );
  return rows.map((r) => r.merchant);
}
