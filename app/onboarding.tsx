import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { Button } from '../src/components/ui/Button';
import { useSettingsStore } from '../src/stores/settingsStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'add-circle' as const,
    title: 'Log Spends in Seconds',
    description:
      'Add an expense with a couple of taps — amount, who paid, and how. Ginti keeps it all tidy and beautiful.',
  },
  {
    id: '2',
    icon: 'sparkles' as const,
    title: 'Friendly Daily Nudges',
    description:
      'A nightly recap of what you spent, plus a couple of fun reminders to log your expenses. No spam, just good vibes.',
  },
  {
    id: '3',
    icon: 'analytics' as const,
    title: 'Smart Analytics',
    description:
      'See where your money goes with category breakdowns, spending trends, merchant insights, and a calendar view.',
  },
  {
    id: '4',
    icon: 'wallet' as const,
    title: 'Budgets That Carry Forward',
    description:
      'Set overall and per-category budgets. They roll over month to month, and you get a heads-up as you near a limit.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await completeOnboarding();
      router.replace('/permission');
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={64} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Button
          label={isLast ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          fullWidth
        />

        {!isLast && (
          <TouchableOpacity
            onPress={async () => {
              await completeOnboarding();
              router.replace('/permission');
            }}
            style={styles.skip}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  skip: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
