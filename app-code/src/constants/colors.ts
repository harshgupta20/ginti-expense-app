export const Colors = {
  // Deep-forest dark neutrals — subtly green-tinted to match the Ginti brand.
  background: '#0A1611',
  surface: '#101E17',
  card: '#16251D',
  cardElevated: '#1E2E25',
  border: '#26332B',
  borderLight: '#2F3B33',

  // Brand green (the leaf/wallet mark). Same contrast profile as the old accent.
  primary: '#2E8B5A',
  primaryDim: '#2E8B5A22',
  primaryLight: '#5AC08A',

  success: '#22C55E',
  successDim: '#22C55E22',
  warning: '#F59E0B',
  warningDim: '#F59E0B22',
  error: '#EF4444',
  errorDim: '#EF444422',
  info: '#3B82F6',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textDisabled: '#4B5563',

  income: '#22C55E',
  expense: '#EF4444',
  transfer: '#3B82F6',
  cashback: '#F59E0B',

  tabBar: '#0D1B14',
  tabBarBorder: '#182319',
  tabActive: '#2E8B5A',
  tabInactive: '#6B7280',

  categoryColors: {
    Food: '#F97316',
    Travel: '#3B82F6',
    Shopping: '#EC4899',
    Bills: '#8B5CF6',
    Recharge: '#06B6D4',
    Entertainment: '#EF4444',
    Subscriptions: '#A855F7',
    Health: '#10B981',
    Education: '#F59E0B',
    Investments: '#22C55E',
    Transfers: '#6B7280',
    Income: '#22C55E',
    Others: '#9CA3AF',
  } as Record<string, string>,

  chart: ['#2E8B5A', '#F97316', '#22C55E', '#EF4444', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#A855F7', '#06B6D4', '#8B5CF6', '#14B8A6'],
} as const;
