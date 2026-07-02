import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { Button } from '../src/components/ui/Button';
import { ProgressBar } from '../src/components/ui/ProgressBar';
import { Wordmark } from '../src/components/Wordmark';
import { CountryPickerModal } from '../src/components/CountryPickerModal';
import { useSettingsStore } from '../src/stores/settingsStore';
import { DEFAULT_COUNTRY, getCountry, getCurrency } from '../src/constants/currencies';

// Each reading screen locks "Next" for this many seconds — a deliberate,
// unskippable read so the value proposition actually lands.
const GATE_SECONDS = 4;

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  brand?: boolean;
  title: string;
  description: string;
  bullets?: string[];
}

const SLIDES: Slide[] = [
  {
    icon: 'wallet',
    iconColor: Colors.primary,
    brand: true,
    title: 'Welcome to Ginti',
    description:
      'The calm, private way to track every rupee, dollar or euro. Log spends in seconds and always know where your money goes.',
  },
  {
    icon: 'shield-checkmark',
    iconColor: Colors.success,
    title: '100% Private',
    description:
      'Your data never leaves your phone. No cloud, no accounts, no servers. Everything you log lives on your device — and only your device.',
  },
  {
    icon: 'lock-closed',
    iconColor: '#3B82F6',
    title: 'Shared With No One',
    description:
      'We never share your data — not with advertisers, not with the government, not with anyone. There is quite literally nothing to share, because we can’t see it.',
  },
  {
    icon: 'cloud-download',
    iconColor: '#A855F7',
    title: 'Your Data, Your Control',
    description:
      'Export a full report or back up everything in one tap. Switch phones anytime and carry your entire history with you.',
  },
  {
    icon: 'sparkles',
    iconColor: Colors.warning,
    title: 'Everything You Need',
    description: 'Thoughtfully built, genuinely useful — no clutter, no noise.',
    bullets: [
      'Lightning-fast manual logging',
      'Budgets that carry forward each month',
      'Daily, weekly, monthly & yearly subscriptions',
      'Rich analytics, trends & insights',
      'Calendar view with per-day totals',
      'One-tap CSV / report export & backup',
    ],
  },
];

const TOTAL_STEPS = SLIDES.length + 1; // + country step

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(GATE_SECONDS);
  const [country, setCountrySel] = useState(DEFAULT_COUNTRY);
  const [pickerVisible, setPickerVisible] = useState(false);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setCountry = useSettingsStore((s) => s.setCountry);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCountryStep = index === SLIDES.length;
  const slide = SLIDES[index];
  const locked = !isCountryStep && remaining > 0;

  // Read-gate countdown — only on the reading slides, not the country step.
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (isCountryStep) {
      setRemaining(0);
      return;
    }
    setRemaining(GATE_SECONDS);
    timer.current = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, Math.round((r - 0.1) * 10) / 10);
        if (next <= 0 && timer.current) clearInterval(timer.current);
        return next;
      });
    }, 100);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [index, isCountryStep]);

  const handleNext = async () => {
    if (locked) return;
    if (isCountryStep) {
      await setCountry(country);
      await completeOnboarding();
      router.replace('/permission');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const progress = ((GATE_SECONDS - remaining) / GATE_SECONDS) * 100;
  const selectedCountry = getCountry(country);
  const selectedCurrency = selectedCountry ? getCurrency(selectedCountry.currency) : getCurrency('USD');

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Wordmark size="sm" />
        <Text style={styles.step}>{index + 1} / {TOTAL_STEPS}</Text>
      </View>

      {isCountryStep ? (
        <View style={styles.slide}>
          <View style={[styles.iconCircle, { backgroundColor: `${Colors.primary}22` }]}>
            <Ionicons name="globe" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.description}>
            Pick your country so Ginti shows amounts in your currency. You can change this anytime in Settings.
          </Text>

          <TouchableOpacity style={styles.countrySelector} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
            <Text style={styles.countryFlag}>{selectedCountry?.flag ?? '🌍'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.countryName}>{selectedCountry?.name ?? 'Select country'}</Text>
              <Text style={styles.countryCurrency}>
                {selectedCurrency.code} · {selectedCurrency.symbol}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.previewChip}>
            <Text style={styles.previewText}>
              Example: {selectedCurrency.symbol}1,250 spent this week
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.slide}>
          <View style={[styles.iconCircle, { backgroundColor: `${slide.iconColor}22` }]}>
            <Ionicons name={slide.icon} size={60} color={slide.iconColor} />
          </View>

          {slide.brand ? (
            <View style={styles.brandRow}>
              <Wordmark size="lg" />
            </View>
          ) : null}

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          {slide.bullets && (
            <View style={styles.bullets}>
              {slide.bullets.map((b) => (
                <View key={b} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        {locked && <ProgressBar percentage={progress} color={Colors.primary} height={4} />}

        <Button
          label={locked ? `Please read… ${Math.ceil(remaining)}` : isCountryStep ? 'Get Started' : 'Next'}
          onPress={handleNext}
          disabled={locked}
          size="lg"
          fullWidth
        />
      </View>

      <CountryPickerModal
        visible={pickerVisible}
        selectedCode={country}
        onSelect={setCountrySel}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  step: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandRow: { marginBottom: -4 },
  title: {
    fontSize: 27,
    fontWeight: '800',
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
  bullets: { alignSelf: 'stretch', gap: 12, marginTop: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletText: { flex: 1, fontSize: 15, color: Colors.textPrimary, lineHeight: 20 },

  countrySelector: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 4,
  },
  countryFlag: { fontSize: 30 },
  countryName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  countryCurrency: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  previewChip: {
    backgroundColor: Colors.primaryDim,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  previewText: { fontSize: 13, color: Colors.primaryLight, fontWeight: '600' },

  footer: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 20, backgroundColor: Colors.primary },
});
