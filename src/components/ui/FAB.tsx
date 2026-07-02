import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

interface FABProps {
  /** Route to push when pressed. Defaults to the add-transaction screen. Ignored if onPress is set. */
  href?: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
}

/**
 * Floating action button pinned bottom-right, above the tab bar.
 * Replaces the old header "+" for adding transactions.
 */
export function FAB({ href = '/add-transaction', onPress, icon = 'add', label }: FABProps) {
  const router = useRouter();

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => (onPress ? onPress() : router.push(href as never))}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Add transaction'}
      >
        <Ionicons name={icon} size={28} color="#fff" />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 18,
    bottom: 22,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    minWidth: 60,
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 30,
    justifyContent: 'center',
    // Elevation / shadow to make it pop above content.
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  label: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
