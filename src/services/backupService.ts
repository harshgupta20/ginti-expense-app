import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import { exportAllData, importAllData, BackupData } from '../db/database';

/**
 * Writes a full JSON backup of all app data and opens the share sheet so the
 * user can save it (e.g. to Drive/Files) and restore on a new phone.
 */
export async function exportBackup(): Promise<string> {
  const data = await exportAllData();
  const json = JSON.stringify(data);
  const filename = `ginti-backup_${dayjs().format('YYYY-MM-DD_HH-mm')}.json`;
  const path = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Export Ginti Backup',
      UTI: 'public.json',
    });
  }
  return path;
}

export interface ImportResult {
  ok: boolean;
  cancelled?: boolean;
  message: string;
  counts?: { transactions: number; subscriptions: number; budgets: number };
}

/**
 * Lets the user pick a previously-exported backup file and replaces all current
 * data with it. Validates the file shape before touching the database.
 */
export async function importBackup(): Promise<ImportResult> {
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.[0]) {
    return { ok: false, cancelled: true, message: 'Import cancelled.' };
  }

  let data: BackupData;
  try {
    const content = await FileSystem.readAsStringAsync(res.assets[0].uri);
    data = JSON.parse(content) as BackupData;
  } catch {
    return { ok: false, message: 'Could not read the file. Make sure it is a Ginti backup.' };
  }

  if (!data || typeof data !== 'object' || !Array.isArray(data.transactions)) {
    return { ok: false, message: 'This does not look like a valid Ginti backup file.' };
  }

  await importAllData(data);
  return {
    ok: true,
    message: 'Backup restored successfully.',
    counts: {
      transactions: data.transactions?.length ?? 0,
      subscriptions: data.subscriptions?.length ?? 0,
      budgets: data.budget_periods?.length ?? 0,
    },
  };
}
