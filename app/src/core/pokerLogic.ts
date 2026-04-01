import type { Rank } from './models';

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const RANK_INDEX: Record<string, number> = Object.fromEntries(RANKS.map((r, i) => [r, i]));

/** Returns the canonical 13x13 matrix: pairs on diagonal, suited upper-right, offsuit lower-left */
export function getHandMatrix(): string[] {
  const matrix: string[] = [];
  for (let i = 0; i < RANKS.length; i++) {
    for (let j = 0; j < RANKS.length; j++) {
      const r1 = RANKS[i];
      const r2 = RANKS[j];
      if (i === j) matrix.push(`${r1}${r2}`);
      else if (i < j) matrix.push(`${r1}${r2}s`);
      else matrix.push(`${r2}${r1}o`);
    }
  }
  return matrix;
}

/**
 * Parse a poker range notation string into combos with frequencies.
 * Supports: "AA", "22+", "A2s+", "KTs+", "JJ-22", "A5s:0.5"
 *
 * Returns a map of { comboId -> frequency (0..1) }
 */
export function parseRangeNotation(notation: string): Record<string, number> {
  const result: Record<string, number> = {};

  // Parse frequency suffix ":0.5"
  const [comboStr, freqStr] = notation.split(':');
  const freq = freqStr !== undefined ? parseFloat(freqStr) : 1.0;

  const str = comboStr.trim();

  // Pair with "+" e.g. "22+"
  const pairPlusMatch = str.match(/^([AKQJT98765432])\1\+$/);
  if (pairPlusMatch) {
    const startRank = pairPlusMatch[1] as Rank;
    const startIdx = RANK_INDEX[startRank];
    for (let i = 0; i <= startIdx; i++) {
      result[`${RANKS[i]}${RANKS[i]}`] = freq;
    }
    return result;
  }

  // Pair range "JJ-22"
  const pairRangeMatch = str.match(/^([AKQJT98765432])\1-([AKQJT98765432])\2$/);
  if (pairRangeMatch) {
    const topIdx = RANK_INDEX[pairRangeMatch[1]];
    const botIdx = RANK_INDEX[pairRangeMatch[2]];
    for (let i = topIdx; i <= botIdx; i++) {
      result[`${RANKS[i]}${RANKS[i]}`] = freq;
    }
    return result;
  }

  // Specific pair e.g. "AA", "KK"
  const specificPairMatch = str.match(/^([AKQJT98765432])\1$/);
  if (specificPairMatch) {
    result[str] = freq;
    return result;
  }

  // Suited "+" e.g. "A2s+", "KTs+"
  const suitedPlusMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])s\+$/);
  if (suitedPlusMatch) {
    const r1 = suitedPlusMatch[1] as Rank;
    const r2 = suitedPlusMatch[2] as Rank;
    const r1Idx = RANK_INDEX[r1];
    const r2Idx = RANK_INDEX[r2];
    // RANKS goes A(0)→2(12), so r2Idx > r1Idx. Iterate downward.
    for (let i = r2Idx; i > r1Idx; i--) {
      result[`${r1}${RANKS[i]}s`] = freq;
    }
    return result;
  }

  // Offsuit "+" e.g. "AJo+"
  const offsuitPlusMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])o\+$/);
  if (offsuitPlusMatch) {
    const r1 = offsuitPlusMatch[1] as Rank;
    const r2 = offsuitPlusMatch[2] as Rank;
    const r1Idx = RANK_INDEX[r1];
    const r2Idx = RANK_INDEX[r2];
    // RANKS goes A(0)→2(12), so r2Idx > r1Idx. Iterate downward.
    for (let i = r2Idx; i > r1Idx; i--) {
      const combo = `${r1}${RANKS[i]}o`;
      result[combo] = freq;
    }
    return result;
  }

  // Suited specific e.g. "AKs", "T9s"
  const suitedMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])s$/);
  if (suitedMatch) {
    result[str] = freq;
    return result;
  }

  // Offsuit specific e.g. "AKo"
  const offsuitMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])o$/);
  if (offsuitMatch) {
    result[str] = freq;
    return result;
  }

  // Generic specific e.g. "AK", "JT" (matches both suited and offsuit)
  const genericMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])$/);
  if (genericMatch) {
    const r1 = genericMatch[1];
    const r2 = genericMatch[2];
    if (r1 !== r2) {
      result[`${r1}${r2}s`] = freq;
      result[`${r1}${r2}o`] = freq;
      return result;
    }
  }

  // Generic plus e.g. "AQ+" (matches AQs+ and AQo+)
  const genericPlusMatch = str.match(/^([AKQJT98765432])([AKQJT98765432])\+$/);
  if (genericPlusMatch) {
    const r1 = genericPlusMatch[1] as Rank;
    const r2 = genericPlusMatch[2] as Rank;
    const r1Idx = RANK_INDEX[r1];
    const r2Idx = RANK_INDEX[r2];
    if (r1 !== r2) {
      for (let i = r2Idx; i > r1Idx; i--) {
        result[`${r1}${RANKS[i]}s`] = freq;
        result[`${r1}${RANKS[i]}o`] = freq;
      }
      return result;
    }
  }

  console.warn(`[rangeParser] Could not parse: "${notation}"`);
  return result;
}

/**
 * Parse an array of range notation strings into a merged combo map.
 * e.g. ["AA", "KK", "A5s:0.5"] → { AA: 1, KK: 1, A5s: 0.5 }
 */
export function parseRangeArray(notations: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const notation of notations) {
    const parsed = parseRangeNotation(notation);
    Object.assign(result, parsed);
  }
  return result;
}
