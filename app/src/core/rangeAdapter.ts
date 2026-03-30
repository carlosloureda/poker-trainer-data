import type { RangeCraftJSON, ResolvedPosition, ResolvedCombos, ResolvedSituation, Position } from './models';
import { POSITIONS } from './models';
import { parseRangeArray } from './pokerLogic';

/**
 * Convert a raw situation (flat array OR object of arrays) into ResolvedCombos.
 * For a flat array (open range), all combos get action key "open".
 * For an object, each key is the action type.
 */
function resolveSituation(raw: string[] | Record<string, string[]>): ResolvedCombos {
  const combos: ResolvedCombos = {};

  const addCombos = (actionKey: string, notations: string[]) => {
    const parsed = parseRangeArray(notations);
    for (const [comboId, freq] of Object.entries(parsed)) {
      if (!combos[comboId]) combos[comboId] = {};
      combos[comboId][actionKey] = freq;
    }
  };

  if (Array.isArray(raw)) {
    addCombos('open', raw);
  } else {
    for (const [actionKey, notations] of Object.entries(raw)) {
      addCombos(actionKey, notations);
    }
  }

  return combos;
}

/** Turn a raw situation key like "4bet_vs_btn" into a readable label "4bet vs BTN" */
function situationLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b(utg|hj|co|btn|sb|bb)\b/gi, (m) => m.toUpperCase());
}

/**
 * Parse the full RangeCraftJSON into an array of ResolvedPosition,
 * one per position that exists in the JSON.
 */
export function parseRangeCraftJSON(json: RangeCraftJSON): ResolvedPosition[] {
  const rawData = json.Range_Craft;
  const result: ResolvedPosition[] = [];

  for (const pos of POSITIONS) {
    const posData = rawData[pos];
    if (!posData) continue;

    let open: ResolvedCombos | null = null;
    const situations: ResolvedSituation[] = [];

    for (const [key, rawSituation] of Object.entries(posData)) {
      if (key === 'open') {
        open = resolveSituation(rawSituation as string[]);
      } else {
        const resolved = resolveSituation(rawSituation as Record<string, string[]>);
        situations.push({
          key,
          label: situationLabel(key),
          combos: resolved,
        });
      }
    }

    result.push({ position: pos as Position, open, situations });
  }

  return result;
}
