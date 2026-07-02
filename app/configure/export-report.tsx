import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { DatePickerModal } from '../../src/components/DatePickerModal';
import { useConfigStore } from '../../src/stores/configStore';
import { exportReport, ReportFormat } from '../../src/services/reportExport';
import dayjs from 'dayjs';

type Mode = 'month' | 'year' | 'custom' | 'all';

export default function ExportReportScreen() {
  const categories = useConfigStore((s) => s.categories);
  const [mode, setMode] = useState<Mode>('month');
  const [anchor, setAnchor] = useState(dayjs()); // selected month/year
  const [customStart, setCustomStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [customEnd, setCustomEnd] = useState(dayjs().format('YYYY-MM-DD'));
  const [pickingStart, setPickingStart] = useState(false);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [format, setFormat] = useState<ReportFormat>('csv');
  const [busy, setBusy] = useState(false);

  const range = (): { start: string; end: string; label: string } => {
    if (mode === 'month') {
      return {
        start: anchor.startOf('month').toISOString(),
        end: anchor.endOf('month').toISOString(),
        label: anchor.format('MMMM YYYY'),
      };
    }
    if (mode === 'year') {
      return {
        start: anchor.startOf('year').toISOString(),
        end: anchor.endOf('year').toISOString(),
        label: anchor.format('YYYY'),
      };
    }
    if (mode === 'custom') {
      return {
        start: dayjs(customStart).startOf('day').toISOString(),
        end: dayjs(customEnd).endOf('day').toISOString(),
        label: `${dayjs(customStart).format('DD MMM YYYY')} – ${dayjs(customEnd).format('DD MMM YYYY')}`,
      };
    }
    return { start: dayjs('2000-01-01').toISOString(), end: dayjs().endOf('day').toISOString(), label: 'All time' };
  };

  const shift = (dir: number) => {
    setAnchor((a) => (mode === 'year' ? a.add(dir, 'year') : a.add(dir, 'month')));
  };

  const customInvalid = mode === 'custom' && dayjs(customEnd).isBefore(dayjs(customStart), 'day');

  const handleExport = async () => {
    const r = range();
    const label = category ? `${r.label} · ${category}` : r.label;
    setBusy(true);
    try {
      const res = await exportReport(r.start, r.end, format, label, category);
      if (!res.ok) Alert.alert('Nothing to export', `No transactions found for ${label}.`);
    } catch (e) {
      Alert.alert('Export failed', 'Could not generate the report. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const r = range();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Export your transactions for a chosen period as a table — share the CSV with an accountant or
        open the HTML report in any browser.
      </Text>

      {/* Period mode */}
      <Text style={styles.label}>Period</Text>
      <View style={styles.modeRow}>
        {(['month', 'year', 'custom', 'all'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'month' ? 'Month' : m === 'year' ? 'Year' : m === 'custom' ? 'Custom' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Anchor selector for month/year */}
      {(mode === 'month' || mode === 'year') && (
        <View style={styles.selector}>
          <TouchableOpacity onPress={() => shift(-1)} style={styles.arrow} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.selectorText}>{r.label}</Text>
          <TouchableOpacity onPress={() => shift(1)} style={styles.arrow} hitSlop={10}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Custom date range */}
      {mode === 'custom' && (
        <View style={styles.customRow}>
          <TouchableOpacity style={styles.dateBox} onPress={() => setPickingStart(true)} activeOpacity={0.7}>
            <Text style={styles.dateBoxLabel}>From</Text>
            <Text style={styles.dateBoxValue}>{dayjs(customStart).format('DD MMM YYYY')}</Text>
          </TouchableOpacity>
          <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
          <TouchableOpacity style={styles.dateBox} onPress={() => setPickingEnd(true)} activeOpacity={0.7}>
            <Text style={styles.dateBoxLabel}>To</Text>
            <Text style={styles.dateBoxValue}>{dayjs(customEnd).format('DD MMM YYYY')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {customInvalid && <Text style={styles.errorText}>End date must be on or after the start date.</Text>}

      {/* Category filter */}
      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8 }}>
        <TouchableOpacity
          style={[styles.chip, category === undefined && styles.chipActive]}
          onPress={() => setCategory(undefined)}
        >
          <Text style={[styles.chipText, category === undefined && styles.chipTextActive]}>All categories</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, category === c.name && styles.chipActive]}
            onPress={() => setCategory(c.name)}
          >
            <Text style={[styles.chipText, category === c.name && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Format */}
      <Text style={styles.label}>Format</Text>
      <View style={styles.formatRow}>
        {([
          { key: 'csv' as ReportFormat, icon: 'grid-outline', title: 'CSV', sub: 'Excel / Google Sheets' },
          { key: 'html' as ReportFormat, icon: 'document-text-outline', title: 'HTML Table', sub: 'Open in browser' },
        ]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.formatCard, format === f.key && styles.formatCardActive]}
            onPress={() => setFormat(f.key)}
            activeOpacity={0.8}
          >
            <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={22} color={format === f.key ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.formatTitle, format === f.key && { color: Colors.primary }]}>{f.title}</Text>
            <Text style={styles.formatSub}>{f.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.previewCard} padding={14}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.previewText}>
          Exporting <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{r.label}</Text>
          {category ? <Text> · {category}</Text> : null} as {format.toUpperCase()}.
        </Text>
      </Card>

      <Button
        label={busy ? 'Preparing…' : 'Export & Share'}
        onPress={handleExport}
        disabled={busy || customInvalid}
        fullWidth
        style={{ marginTop: 12 }}
      />
      {busy && <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />}

      <DatePickerModal
        visible={pickingStart}
        value={customStart}
        maxDate={dayjs().format('YYYY-MM-DD')}
        onSelect={setCustomStart}
        onClose={() => setPickingStart(false)}
        title="Start date"
      />
      <DatePickerModal
        visible={pickingEnd}
        value={customEnd}
        maxDate={dayjs().format('YYYY-MM-DD')}
        onSelect={setCustomEnd}
        onClose={() => setPickingEnd(false)}
        title="End date"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },

  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  modeBtnActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  modeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  modeTextActive: { color: Colors.primary },

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 8,
  },
  arrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  selectorText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dateBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  dateBoxLabel: { fontSize: 11, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateBoxValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 8 },

  chipRow: { flexGrow: 0, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  chipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },

  formatRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  formatCard: { flex: 1, alignItems: 'center', gap: 4, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  formatCardActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  formatTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  formatSub: { fontSize: 11, color: Colors.textMuted },

  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
});
