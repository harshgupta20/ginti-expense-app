import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { exportReport, ReportFormat } from '../../src/services/reportExport';
import dayjs from 'dayjs';

type Mode = 'month' | 'year' | 'all';

export default function ExportReportScreen() {
  const [mode, setMode] = useState<Mode>('month');
  const [anchor, setAnchor] = useState(dayjs()); // selected month/year
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
    return { start: dayjs('2000-01-01').toISOString(), end: dayjs().endOf('day').toISOString(), label: 'All time' };
  };

  const shift = (dir: number) => {
    setAnchor((a) => (mode === 'year' ? a.add(dir, 'year') : a.add(dir, 'month')));
  };

  const handleExport = async () => {
    const r = range();
    setBusy(true);
    try {
      const res = await exportReport(r.start, r.end, format, r.label);
      if (!res.ok) Alert.alert('Nothing to export', `No transactions found for ${r.label}.`);
    } catch (e) {
      Alert.alert('Export failed', 'Could not generate the report. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const r = range();

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        Export your transactions for a chosen period as a table — share the CSV with an accountant or
        open the HTML report in any browser.
      </Text>

      {/* Period mode */}
      <Text style={styles.label}>Period</Text>
      <View style={styles.modeRow}>
        {(['month', 'year', 'all'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'month' ? 'Month' : m === 'year' ? 'Year' : 'All time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Anchor selector */}
      {mode !== 'all' && (
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

      <View style={{ flex: 1 }} />

      <Card style={styles.previewCard} padding={14}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.previewText}>
          Exporting <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{r.label}</Text> as{' '}
          {format.toUpperCase()}.
        </Text>
      </Card>

      <Button
        label={busy ? 'Preparing…' : 'Export & Share'}
        onPress={handleExport}
        disabled={busy}
        fullWidth
        style={{ marginTop: 12 }}
      />
      {busy && <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  intro: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
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
    marginBottom: 20,
  },
  arrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  selectorText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  formatRow: { flexDirection: 'row', gap: 12 },
  formatCard: { flex: 1, alignItems: 'center', gap: 4, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  formatCardActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  formatTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  formatSub: { fontSize: 11, color: Colors.textMuted },

  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
});
