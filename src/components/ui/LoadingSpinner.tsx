import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/** Indian-style digit grouping (1,00,000) without relying on Intl/Hermes. */
function groupIN(n: number): string {
  const s = Math.floor(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
}

/**
 * A flipping ₹ coin over a small coin stack, with a number that rapidly "counts"
 * money — an on-brand loader for Ginti (ginti = count).
 */
export function LoadingSpinner({ label, size = 'large', fullScreen }: LoadingSpinnerProps) {
  const small = size === 'small';
  const coin = small ? 22 : 56;

  const flip = useRef(new Animated.Value(0)).current;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(flip, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => {
      anim.stop();
      flip.setValue(0);
    };
  }, [flip]);

  // The "counting" ticker (skipped for the tiny inline variant).
  useEffect(() => {
    if (small) return;
    const id = setInterval(() => {
      setCount((c) => {
        const next = c + Math.floor(Math.random() * 480) + 60;
        return next > 99999 ? Math.floor(Math.random() * 900) : next;
      });
    }, 70);
    return () => clearInterval(id);
  }, [small]);

  const rotateY = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const lift = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, small ? -4 : -10, 0] });

  const Coin = (
    <View style={[styles.coinWrap, { height: coin + (small ? 6 : 16) }]}>
      {/* coin stack shadow / base */}
      {!small && (
        <>
          <View style={[styles.stackCoin, { width: coin * 0.92, bottom: 0, opacity: 0.35 }]} />
          <View style={[styles.stackCoin, { width: coin * 0.96, bottom: 4, opacity: 0.55 }]} />
        </>
      )}
      <Animated.View
        style={[
          styles.coin,
          {
            width: coin,
            height: coin,
            borderRadius: coin / 2,
            transform: [{ perspective: 700 }, { translateY: lift }, { rotateY }],
          },
        ]}
      >
        <Text style={[styles.rupee, { fontSize: coin * 0.5 }]}>₹</Text>
      </Animated.View>
    </View>
  );

  if (small) {
    return <View style={styles.inline}>{Coin}</View>;
  }

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      {Coin}
      <Text style={styles.counter}>₹{groupIN(count)}</Text>
      <Text style={styles.label}>{label ?? 'Counting…'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  fullScreen: { flex: 1, backgroundColor: Colors.background },
  inline: { alignItems: 'center', justifyContent: 'center' },

  coinWrap: { alignItems: 'center', justifyContent: 'flex-end' },
  coin: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  rupee: { color: '#fff', fontWeight: '800' },
  stackCoin: {
    position: 'absolute',
    height: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  counter: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
    marginTop: 6,
  },
  label: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
