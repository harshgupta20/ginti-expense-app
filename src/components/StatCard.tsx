import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Card } from './ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subValue?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, icon, iconColor, subValue, style }: StatCardProps) {
  return (
    <Card style={[styles.card, style]} padding={16}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor ?? Colors.primary}22` }]}>
          <Ionicons name={icon} size={18} color={iconColor ?? Colors.primary} />
        </View>
      )}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  subValue: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
