export const CREATE_RAW_NOTIFICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS raw_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_name TEXT NOT NULL,
    notification_title TEXT NOT NULL DEFAULT '',
    notification_body TEXT NOT NULL DEFAULT '',
    received_at TEXT NOT NULL,
    processed INTEGER NOT NULL DEFAULT 0,
    parsing_version TEXT NOT NULL DEFAULT '1.0.0'
  );
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    merchant_name TEXT NOT NULL DEFAULT '',
    normalized_merchant_name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Others',
    source_app TEXT NOT NULL DEFAULT 'Unknown',
    transaction_type TEXT NOT NULL DEFAULT 'unknown',
    confidence_score REAL NOT NULL DEFAULT 0,
    raw_notification_id INTEGER,
    transaction_timestamp TEXT NOT NULL,
    created_at TEXT NOT NULL,
    needs_review INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (raw_notification_id) REFERENCES raw_notifications(id)
  );
`;

export const CREATE_MERCHANT_ALIASES_TABLE = `
  CREATE TABLE IF NOT EXISTS merchant_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_name TEXT NOT NULL UNIQUE,
    normalized_name TEXT NOT NULL
  );
`;

export const CREATE_PARSER_FEEDBACK_TABLE = `
  CREATE TABLE IF NOT EXISTS parser_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_notification_id INTEGER,
    transaction_id INTEGER,
    corrected_merchant TEXT,
    corrected_category TEXT,
    corrected_amount REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (raw_notification_id) REFERENCES raw_notifications(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
  );
`;

export const CREATE_BUDGETS_TABLE = `
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL UNIQUE,
    monthly_limit REAL NOT NULL
  );
`;

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#9CA3AF',
    icon TEXT NOT NULL DEFAULT 'ellipsis-horizontal-circle',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_default INTEGER NOT NULL DEFAULT 0
  );
`;

export const CREATE_PAYMENT_SOURCES_TABLE = `
  CREATE TABLE IF NOT EXISTS payment_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT 'card',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_default INTEGER NOT NULL DEFAULT 0
  );
`;

export const CREATE_MEMBERS_TABLE = `
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    relation TEXT NOT NULL DEFAULT 'self',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_default INTEGER NOT NULL DEFAULT 0
  );
`;

// month is 'YYYY-MM'; category NULL means the overall (all-category) budget for that month.
export const CREATE_BUDGET_PERIODS_TABLE = `
  CREATE TABLE IF NOT EXISTS budget_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    category TEXT,
    limit_amount REAL NOT NULL,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_BUDGET_PERIODS_INDEX = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_periods_month_cat
  ON budget_periods(month, IFNULL(category, '__overall__'));
`;

export const CREATE_SUBSCRIPTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    category TEXT NOT NULL DEFAULT 'Subscriptions',
    payment_source TEXT,
    paid_by_member_id INTEGER,
    day_of_month INTEGER NOT NULL DEFAULT 1,
    start_month TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(transaction_timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(normalized_merchant_name);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source_app);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_needs_review ON transactions(needs_review);`,
  `CREATE INDEX IF NOT EXISTS idx_raw_notifications_processed ON raw_notifications(processed);`,
  `CREATE INDEX IF NOT EXISTS idx_raw_notifications_package ON raw_notifications(package_name);`,
];

// [name, color, icon] — colors mirror Colors.categoryColors, icons mirror CategoryIcon map.
export const DEFAULT_CATEGORIES: [string, string, string][] = [
  ['Food', '#F97316', 'fast-food'],
  ['Travel', '#3B82F6', 'car'],
  ['Shopping', '#EC4899', 'bag-handle'],
  ['Bills', '#8B5CF6', 'receipt'],
  ['Recharge', '#06B6D4', 'phone-portrait'],
  ['Entertainment', '#EF4444', 'film'],
  ['Subscriptions', '#A855F7', 'refresh-circle'],
  ['Health', '#10B981', 'heart'],
  ['Education', '#F59E0B', 'book'],
  ['Investments', '#22C55E', 'trending-up'],
  ['Transfers', '#6B7280', 'swap-horizontal'],
  ['Income', '#22C55E', 'arrow-down-circle'],
  ['Others', '#9CA3AF', 'ellipsis-horizontal-circle'],
];

// [name, icon]
export const DEFAULT_PAYMENT_SOURCES: [string, string][] = [
  ['Cash', 'cash'],
  ['PhonePe', 'phone-portrait'],
  ['Google Pay', 'logo-google'],
  ['Paytm', 'wallet'],
  ['BHIM', 'qr-code'],
  ['CRED', 'card'],
  ['Card', 'card'],
  ['Bank Transfer', 'business'],
  ['Other', 'ellipsis-horizontal-circle'],
];

// [name, relation]
export const DEFAULT_MEMBERS: [string, string][] = [
  ['Me', 'self'],
];

export const DEFAULT_MERCHANT_ALIASES = [
  ['STARBUCKS INDIA PRIVATE LIMITED', 'Starbucks'],
  ['STARBUCKS COFFEE', 'Starbucks'],
  ['SWIGGY LIMITED', 'Swiggy'],
  ['SWIGGY INSTAMART', 'Swiggy'],
  ['BUNDL TECHNOLOGIES', 'Swiggy'],
  ['ZOMATO LIMITED', 'Zomato'],
  ['ZOMATO MEDIA', 'Zomato'],
  ['AMAZON SELLER SERVICES', 'Amazon'],
  ['AMAZON PAY', 'Amazon Pay'],
  ['AMAZON MARKETPLACE', 'Amazon'],
  ['FLIPKART INTERNET', 'Flipkart'],
  ['WALMART', 'Flipkart'],
  ['UBER INDIA', 'Uber'],
  ['ANI TECHNOLOGIES', 'Ola'],
  ['NETFLIX ENTERTAINMENT', 'Netflix'],
  ['NETFLIX INDIA', 'Netflix'],
  ['SPOTIFY AB', 'Spotify'],
  ['OPENAI', 'ChatGPT'],
  ['GOOGLE INDIA', 'Google'],
  ['YOUTUBE PREMIUM', 'YouTube'],
  ['APPLE INDIA', 'Apple'],
  ['META PLATFORMS', 'Meta'],
  ['RAPIDO', 'Rapido'],
  ['BLINKIT', 'Blinkit'],
  ['GROFERS INDIA', 'Blinkit'],
  ['ZEPTO', 'Zepto'],
  ['BIGBASKET', 'BigBasket'],
  ['SUPERMARKET GROCERY SUPPLIES', 'BigBasket'],
  ['DOMINOS PIZZA', 'Dominos'],
  ['JUBILANT FOODWORKS', 'Dominos'],
  ['KFC INDIA', 'KFC'],
  ['RESTAURANT BRANDS', 'Burger King'],
  ['BOOKMYSHOW', 'BookMyShow'],
  ['BIGTREE ENTERTAINMENT', 'BookMyShow'],
  ['MAKEMYTRIP', 'MakeMyTrip'],
  ['IBIBO GROUP', 'Goibibo'],
  ['CLEARTRIP', 'Cleartrip'],
  ['IRCTC', 'IRCTC'],
  ['PHONEPE', 'PhonePe'],
  ['PAYTM', 'Paytm'],
  ['NYKAA', 'Nykaa'],
  ['FSN ECOMMERCE', 'Nykaa'],
  ['MYNTRA', 'Myntra'],
  ['AJIO', 'AJIO'],
  ['MEESHO', 'Meesho'],
  ['TATAPLAY', 'Tata Play'],
  ['TATA SKY', 'Tata Play'],
  ['HOTSTAR', 'Hotstar'],
  ['DISNEY INDIA', 'Hotstar'],
  ['1MG', '1mg'],
  ['TATA 1MG', '1mg'],
  ['NETMEDS', 'Netmeds'],
  ['APOLLOPHARMACY', 'Apollo Pharmacy'],
  ['APOLLO HOSPITALS', 'Apollo Pharmacy'],
  ['PHARMEASY', 'PharmEasy'],
  ['UNACADEMY', 'Unacademy'],
  ['THINK AND LEARN', 'BYJU\'S'],
  ['BYJU', 'BYJU\'S'],
  ['UDEMY', 'Udemy'],
  ['ZERODHA', 'Zerodha'],
  ['ZERODHA BROKING', 'Zerodha'],
  ['GROWW', 'Groww'],
  ['NEXTBILLION', 'Groww'],
  ['UPSTOX', 'Upstox'],
  ['RKSV', 'Upstox'],
];
