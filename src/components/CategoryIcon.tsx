import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { Colors } from '../constants/colors';
import { useConfigStore } from '../stores/configStore';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Food: 'fast-food',
  Travel: 'car',
  Shopping: 'bag-handle',
  Bills: 'receipt',
  Recharge: 'phone-portrait',
  Entertainment: 'film',
  Subscriptions: 'refresh-circle',
  Health: 'heart',
  Education: 'book',
  Investments: 'trending-up',
  Transfers: 'swap-horizontal',
  Income: 'arrow-down-circle',
  Others: 'ellipsis-horizontal-circle',
};

interface CategoryIconProps {
  category: Category;
  size?: number;
  showBackground?: boolean;
}

export function CategoryIcon({ category, size = 20, showBackground = true }: CategoryIconProps) {
  const config = useConfigStore((s) => s.categories.find((c) => c.name === category));
  const color = config?.color ?? Colors.categoryColors[category] ?? Colors.textSecondary;
  const iconName = (config?.icon as keyof typeof Ionicons.glyphMap) ??
    CATEGORY_ICONS[category] ?? 'ellipsis-horizontal-circle';

  if (!showBackground) {
    return <Ionicons name={iconName} size={size} color={color} />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color}22`,
          width: size * 2,
          height: size * 2,
          borderRadius: size,
        },
      ]}
    >
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
