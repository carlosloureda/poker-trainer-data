// ─── Types for the Range JSON ────────────────────────────────────────────────

export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Suit = 'h' | 'd' | 'c' | 's';

/** The 6 hero positions in 6-max */
export type Position = 'utg' | 'hj' | 'co' | 'btn' | 'sb' | 'bb';
export const POSITIONS: Position[] = ['utg', 'hj', 'co', 'btn', 'sb', 'bb'];
export const POSITION_LABELS: Record<Position, string> = {
  utg: 'UTG', hj: 'HJ', co: 'CO', btn: 'BTN', sb: 'SB', bb: 'BB'
};

/** Action types inside a situation */
export type ActionType =
  | 'open'
  | '3bet_shove'
  | '3bet_5bet_shove'
  | '3bet_call'
  | '3bet_fold'
  | 'call_open'
  | '4bet_6bet'
  | '4bet_fold'
  | '4bet_call'
  | 'call_3bet'
  | 'call'
  | 'squeeze';

/** Default colors for each action type */
export const ACTION_COLORS: Record<string, string> = {
  open:             '#ef4444', 
  '3bet_5bet_shove':'#ef4444', 
  '3bet_shove':     '#ef4444',
  '3bet_call':      '#ef4444',
  '4bet_6bet':      '#ef4444', 
  '4bet_call':      '#ef4444',
  '3bet_fold':      '#f97316', 
  '4bet_fold':      '#f97316', 
  call_open:        '#3b82f6', 
  call_3bet:        '#3b82f6', 
  call:             '#3b82f6',
  squeeze:          '#a855f7', 
};

// ─── The raw JSON shape ───────────────────────────────────────────────────────

/**
 * A "situation" can be either:
 *  - A flat array of combo strings (for "open")
 *  - An object mapping action types to arrays of combo strings
 */
export type RawSituation = string[] | Record<string, string[]>;

export type RawPositionData = Record<string, RawSituation>;

export interface RangeCraftJSON {
  Range_Craft: Record<string, RawPositionData>;
}

// ─── Parsed / resolved types (used by UI) ────────────────────────────────────

/**
 * A resolved combo cell: maps actionType → frequency (0..1)
 * e.g. { "3bet_5bet_shove": 1, "call_open": 0 }
 */
export type ResolvedCombos = Record<string, Record<string, number>>;

/**
 * A resolved situation: label + map of comboId → { actionType: freq }
 */
export interface ResolvedSituation {
  key: string;           // e.g. "4bet_vs_btn"
  label: string;         // e.g. "4bet vs BTN"
  combos: ResolvedCombos;
  allowedActions: string[];
}

/** All resolved data for one position */
export interface ResolvedPosition {
  position: Position;
  open: ResolvedSituation | null;
  situations: ResolvedSituation[];
}
