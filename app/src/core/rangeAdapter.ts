import type { RangeCraftJSON, ResolvedPosition, ResolvedCombos, ResolvedSituation, Position } from './models';
import { POSITIONS } from './models';
import { parseRangeArray } from './pokerLogic';

/**
 * Convert a raw situation (flat array OR object of arrays) into ResolvedCombos.
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
 * Parse the full RangeCraftJSON into an array of ResolvedPosition.
 */
export function parseRangeCraftJSON(json: RangeCraftJSON): ResolvedPosition[] {
  const rawData = json.Range_Craft;
  const result: ResolvedPosition[] = [];

  for (const pos of POSITIONS) {
    const posData = rawData[pos];
    if (!posData) continue;

    let open: ResolvedSituation | null = null;
    const situations: ResolvedSituation[] = [];

    for (const [key, rawSituation] of Object.entries(posData)) {
      const resolvedCombos = resolveSituation(rawSituation as Record<string, string[]>);
      const allowedActions = Array.isArray(rawSituation) ? ['open'] : Object.keys(rawSituation);
      
      const sit: ResolvedSituation = {
        key,
        label: situationLabel(key),
        combos: resolvedCombos,
        allowedActions,
      };

      if (key === 'open') {
        open = sit;
      }
      situations.push(sit);
    }

    result.push({ position: pos as Position, open, situations });
  }

  return result;
}

/**
 * Convert ResolvedCombos back to the notation structure { action: ["hand", "hand:freq"] }
 */
function unresolveSituation(combos: ResolvedCombos): string[] | Record<string, string[]> {
  const actions: Record<string, string[]> = {};

  for (const [hand, weights] of Object.entries(combos)) {
    for (const [action, freq] of Object.entries(weights)) {
      if (!actions[action]) actions[action] = [];
      const notation = freq === 1 ? hand : `${hand}:${freq}`;
      actions[action].push(notation);
    }
  }

  const keys = Object.keys(actions);
  if (keys.length === 1 && keys[0] === 'open') {
    return actions.open;
  }

  return actions;
}

/**
 * Reverse of parseRangeCraftJSON. Converts internal state back to JSON.
 */
export function unparseRangeCraftJSON(positions: ResolvedPosition[]): RangeCraftJSON {
  const rangeCraft: Record<string, any> = {};

  for (const pos of positions) {
    const posData: Record<string, any> = {};
    
    // In our new model, 'open' is also in the situations array, but let's be safe
    for (const sit of pos.situations) {
      posData[sit.key] = unresolveSituation(sit.combos);
    }

    rangeCraft[pos.position] = posData;
  }

  return { Range_Craft: rangeCraft };
}
