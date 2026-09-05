import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllTransactionsForExport } from '../db/database';
import dayjs from 'dayjs';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportTransactionsCSV(): Promise<string> {
  const transactions = await getAllTransactionsForExport();

  const headers = [
    'Date',
    'Time',
    'Amount',
    'Merchant',
    'Category',
    'Type',
    'Source App',
    'Confidence',
  ];

  const rows = transactions.map((tx) => {
    const dt = dayjs(tx.transaction_timestamp);
    return [
      dt.format('DD/MM/YYYY'),
      dt.format('HH:mm:ss'),
      tx.amount.toFixed(2),
      tx.normalized_merchant_name || tx.merchant_name,
      tx.category,
      tx.transaction_type,
      tx.source_app,
      (tx.confidence_score * 100).toFixed(0) + '%',
    ].map(escapeCSV).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `expenses_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`;
  const path = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  return path;
}

export async function shareExportedCSV(): Promise<void> {
  const path = await exportTransactionsCSV();
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Expense Data',
      UTI: 'public.comma-separated-values-text',
    });
  }
}
