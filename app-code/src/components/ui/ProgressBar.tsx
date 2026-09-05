import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  percentage,
  color,
  height = 6,
  backgroundColor = Colors.border,
}: ProgressBarProps) {
  const capped = Math.min(Math.max(percentage, 0), 100);
  const barColor = color ?? (capped >= 100 ? Colors.error : capped >= 80 ? Colors.warning : Colors.primary);

  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          { width: `${capped}%` as `${number}%`, height, backgroundColor: barColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 100,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 100,
  },
});
