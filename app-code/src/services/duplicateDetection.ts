import { DuplicateCheckResult, Transaction } from '../types';
import { getNearDuplicates } from '../db/database';

const DUPLICATE_WINDOW_SECONDS = 300; // 5 minutes
const AMOUNT_TOLERANCE = 0.01;

export async function checkDuplicate(
  amount: number,
  timestamp: string,
  normalizedMerchant: string
): Promise<DuplicateCheckResult> {
  const candidates = await getNearDuplicates(amount, timestamp, DUPLICATE_WINDOW_SECONDS);

  if (candidates.length === 0) {
    return { isDuplicate: false, confidence: 0 };
  }

  for (const candidate of candidates) {
    const amountMatch = Math.abs(candidate.amount - amount) <= AMOUNT_TOLERANCE;
    const merchantMatch =
      normalizedMerchant === '' ||
      candidate.normalized_merchant_name === '' ||
      candidate.normalized_merchant_name.toLowerCase() === normalizedMerchant.toLowerCase();

    if (amountMatch && merchantMatch) {
      return {
        isDuplicate: true,
        existingTransactionId: candidate.id,
        confidence: 0.95,
      };
    }

    // Same amount, different merchant — lower confidence duplicate
    if (amountMatch) {
      return {
        isDuplicate: true,
        existingTransactionId: candidate.id,
        confidence: 0.7,
      };
    }
  }

  return { isDuplicate: false, confidence: 0 };
}

export function isSameTransaction(a: Transaction, b: Transaction): boolean {
  const timeDiff = Math.abs(
    new Date(a.transaction_timestamp).getTime() -
    new Date(b.transaction_timestamp).getTime()
  );
  const withinWindow = timeDiff <= DUPLICATE_WINDOW_SECONDS * 1000;
  const sameAmount = Math.abs(a.amount - b.amount) <= AMOUNT_TOLERANCE;
  return withinWindow && sameAmount;
}
