export const Colors = {
  background: '#0A0A0A',
  surface: '#141414',
  card: '#1E1E1E',
  cardElevated: '#262626',
  border: '#2A2A2A',
  borderLight: '#333333',

  primary: '#6C63FF',
  primaryDim: '#6C63FF22',
  primaryLight: '#9C95FF',

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

  tabBar: '#111111',
  tabBarBorder: '#1F1F1F',
  tabActive: '#6C63FF',
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

  chart: ['#6C63FF', '#F97316', '#22C55E', '#EF4444', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#A855F7', '#06B6D4', '#8B5CF6', '#14B8A6'],
} as const;
