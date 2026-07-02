import { getAllMerchantAliases, getMerchantAlias, upsertMerchantAlias } from '../db/database';

/** Title-cases a raw merchant string as a readable fallback name. */
function normalizeMerchantText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

let aliasCache: Map<string, string> | null = null;

export async function loadMerchantAliasCache(): Promise<void> {
  const aliases = await getAllMerchantAliases();
  aliasCache = new Map(
    aliases.map((a) => [a.original_name.toUpperCase().trim(), a.normalized_name])
  );
}

export function invalidateMerchantCache(): void {
  aliasCache = null;
}

export async function normalizeMerchant(rawMerchant: string): Promise<string> {
  if (!rawMerchant || rawMerchant.trim() === '') return '';

  const upper = rawMerchant.toUpperCase().trim();

  // Check cache first
  if (aliasCache) {
    // Exact match
    if (aliasCache.has(upper)) return aliasCache.get(upper)!;

    // Partial/fuzzy match — check if any alias key is a substring
    for (const [key, value] of aliasCache.entries()) {
      if (upper.includes(key) || key.includes(upper)) {
        return value;
      }
    }
  } else {
    // DB lookup
    const alias = await getMerchantAlias(rawMerchant);
    if (alias) return alias;
  }

  // Fall back to title-cased version of the raw name
  return normalizeMerchantText(rawMerchant);
}

export async function addMerchantAlias(
  originalName: string,
  normalizedName: string
): Promise<void> {
  await upsertMerchantAlias(originalName, normalizedName);
  invalidateMerchantCache();
}

// Find the best normalized name for a merchant given all existing aliases
export async function suggestNormalization(rawMerchant: string): Promise<string> {
  return normalizeMerchant(rawMerchant);
}
