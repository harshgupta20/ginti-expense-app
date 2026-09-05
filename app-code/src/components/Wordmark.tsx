import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { currencySymbol } from '../utils/currency';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const SIZES = {
  sm: { badge: 26, radius: 8, icon: 15, name: 18 },
  md: { badge: 34, radius: 10, icon: 19, name: 22 },
  lg: { badge: 64, radius: 18, icon: 34, name: 36 },
} as const;

/** Ginti brand lockup — active-currency badge + wordmark. Used in headers, settings & onboarding. */
export function Wordmark({ size = 'md', showTagline = false }: Props) {
  const s = SIZES[size];
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { width: s.badge, height: s.badge, borderRadius: s.radius }]}>
        <Text
          style={[styles.rupee, { fontSize: s.icon }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {currencySymbol()}
        </Text>
      </View>
      <View>
        <Text style={[styles.name, { fontSize: s.name }]}>
          Ginti<Text style={styles.dot}>.</Text>
        </Text>
        {showTagline && <Text style={styles.tagline}>Count every rupee</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupee: { color: '#fff', fontWeight: '900' },
  name: { fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.2 },
  dot: { color: Colors.primary },
  tagline: { fontSize: 12, color: Colors.textSecondary, marginTop: -2 },
});
