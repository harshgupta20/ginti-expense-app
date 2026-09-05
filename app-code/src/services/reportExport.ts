import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';
import { getTransactionsByDateRange, getAllMembers } from '../db/database';
import { Transaction } from '../types';
import { currencySymbol } from '../utils/currency';

export type ReportFormat = 'csv' | 'html';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

const columns = (): string[] => [
  'Date',
  'Description',
  'Category',
  'Type',
  'Paid via',
  'Paid by',
  `Amount (${currencySymbol()})`,
];

function rowValues(tx: Transaction, memberName: (id: number | null) => string | null): (string | number)[] {
  return [
    dayjs(tx.transaction_timestamp).format('DD/MM/YYYY'),
    tx.normalized_merchant_name || tx.merchant_name || tx.note || '—',
    tx.category,
    tx.transaction_type,
    tx.payment_source || tx.source_app || '—',
    memberName(tx.paid_by_member_id) || '—',
    tx.amount.toFixed(2),
  ];
}

function buildCSV(rows: (string | number)[][]): string {
  return [columns().join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join('\n');
}

function buildHTML(rows: (string | number)[][], title: string, total: number): string {
  const head = columns().map((c) => `<th>${escapeHTML(c)}</th>`).join('');
  const body = rows
    .map(
      (r) =>
        `<tr>${r.map((v, i) => `<td class="${i === r.length - 1 ? 'num' : ''}">${escapeHTML(String(v))}</td>`).join('')}</tr>`
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;margin:24px;color:#111}
  h1{font-size:20px;margin:0 0 4px} .sub{color:#666;font-size:13px;margin-bottom:16px}
  table{border-collapse:collapse;width:100%;font-size:13px}
  th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
  th{background:#2E8B5A;color:#fff} tr:nth-child(even){background:#f1f8f4}
  td.num{text-align:right;font-variant-numeric:tabular-nums}
  tfoot td{font-weight:700;background:#eee}
</style></head><body>
<h1>Ginti — Expense Report</h1>
<div class="sub">${escapeHTML(title)} · ${rows.length} transactions</div>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>
<tfoot><tr><td colspan="6">Total</td><td class="num">${currencySymbol()}${total.toFixed(2)}</td></tr></tfoot>
</table></body></html>`;
}

/**
 * Exports transactions within [startISO, endISO] as a shareable table
 * (CSV for spreadsheets, or a formatted HTML file) — handy for accountants.
 */
export async function exportReport(
  startISO: string,
  endISO: string,
  format: ReportFormat,
  rangeLabel: string,
  category?: string
): Promise<{ ok: boolean; count: number; path?: string }> {
  const [txs, members] = await Promise.all([
    getTransactionsByDateRange(startISO, endISO),
    getAllMembers(),
  ]);
  const expenses = txs
    .filter((t) => t.transaction_type !== 'reminder')
    .filter((t) => !category || t.category === category);
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  const memberName = (id: number | null) => (id != null ? memberMap.get(id) ?? null : null);

  if (expenses.length === 0) return { ok: false, count: 0 };

  const rows = expenses.map((tx) => rowValues(tx, memberName));
  const total = expenses
    .filter((t) => t.transaction_type === 'expense')
    .reduce((a, t) => a + t.amount, 0);

  const ext = format === 'csv' ? 'csv' : 'html';
  const content = format === 'csv' ? buildCSV(rows) : buildHTML(rows, rangeLabel, total);
  const filename = `ginti-report_${dayjs().format('YYYY-MM-DD')}.${ext}`;
  const path = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: format === 'csv' ? 'text/csv' : 'text/html',
      dialogTitle: 'Share Expense Report',
    });
  }
  return { ok: true, count: expenses.length, path };
}
