import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, size = 'md', style }: BadgeProps) {
  const bg = color ? `${color}22` : Colors.primaryDim;
  const fg = color ?? Colors.primary;

  return (
    <View style={[styles.badge, size === 'sm' && styles.sm, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
  textSm: { fontSize: 10 },
});
