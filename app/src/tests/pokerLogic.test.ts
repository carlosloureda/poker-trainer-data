import { describe, it, expect } from 'vitest';
import { parseRangeNotation, parseRangeArray } from '../core/pokerLogic';

describe('parseRangeNotation', () => {
  // ── Pairs ──────────────────────────────────────────────────────────────────
  it('parses a specific pair', () => {
    expect(parseRangeNotation('AA')).toEqual({ AA: 1 });
    expect(parseRangeNotation('22')).toEqual({ 22: 1 });
  });

  it('parses pair+ (22+ = all pairs)', () => {
    const result = parseRangeNotation('22+');
    expect(Object.keys(result)).toHaveLength(13); // all pairs
    expect(result['AA']).toBe(1);
    expect(result['22']).toBe(1);
    expect(result['TT']).toBe(1);
  });

  it('parses pair range JJ-22', () => {
    const result = parseRangeNotation('JJ-22');
    const keys = Object.keys(result);
    expect(keys).toContain('JJ');
    expect(keys).toContain('TT');
    expect(keys).toContain('22');
    expect(keys).not.toContain('QQ');
    expect(keys).not.toContain('AA');
    expect(keys).toHaveLength(10);
  });

  it('parses pair range 99-22', () => {
    const result = parseRangeNotation('99-22');
    expect(Object.keys(result)).toHaveLength(8);
    expect(result['99']).toBe(1);
    expect(result['22']).toBe(1);
  });

  // ── Suited ─────────────────────────────────────────────────────────────────
  it('parses a specific suited hand', () => {
    expect(parseRangeNotation('AKs')).toEqual({ AKs: 1 });
    expect(parseRangeNotation('T9s')).toEqual({ T9s: 1 });
  });

  it('parses A2s+ (all suited aces)', () => {
    const result = parseRangeNotation('A2s+');
    const keys = Object.keys(result);
    expect(keys).toHaveLength(12); // A2s-AKs
    expect(result['AKs']).toBe(1);
    expect(result['A2s']).toBe(1);
    expect(result['ATs']).toBe(1);
    expect(result['AA']).toBeUndefined();
  });

  it('parses KTs+ (KTs, KJs, KQs)', () => {
    const result = parseRangeNotation('KTs+');
    expect(Object.keys(result)).toHaveLength(3);
    expect(result['KTs']).toBe(1);
    expect(result['KJs']).toBe(1);
    expect(result['KQs']).toBe(1);
  });

  // ── Offsuit ────────────────────────────────────────────────────────────────
  it('parses a specific offsuit hand', () => {
    expect(parseRangeNotation('AKo')).toEqual({ AKo: 1 });
  });

  it('parses AJo+ (AJo, AQo, AKo)', () => {
    const result = parseRangeNotation('AJo+');
    expect(Object.keys(result)).toHaveLength(3);
    expect(result['AJo']).toBe(1);
    expect(result['AQo']).toBe(1);
    expect(result['AKo']).toBe(1);
  });

  // ── Frequencies ────────────────────────────────────────────────────────────
  it('parses frequency suffix :0.5', () => {
    expect(parseRangeNotation('A5s:0.5')).toEqual({ A5s: 0.5 });
  });

  it('parses frequency suffix :0.25', () => {
    expect(parseRangeNotation('KK:0.25')).toEqual({ KK: 0.25 });
  });

  // ── Unknown / fallback ─────────────────────────────────────────────────────
  it('falls back gracefully to treating the string as a single combo key', () => {
    const result = parseRangeNotation('ATs');
    expect(result['ATs']).toBe(1);
  });
});

describe('parseRangeArray', () => {
  it('merges multiple notations into a single map', () => {
    const result = parseRangeArray(['AA', 'KK', 'A5s:0.5']);
    expect(result['AA']).toBe(1);
    expect(result['KK']).toBe(1);
    expect(result['A5s']).toBe(0.5);
  });

  it('handles a real UTG open range from the JSON', () => {
    const result = parseRangeArray(['22+', 'A2s+', 'AJo+', 'KQo', 'KTs+', 'QTs+', 'JTs', 'T9s']);
    // Pairs
    expect(result['AA']).toBe(1);
    expect(result['22']).toBe(1);
    // Suited aces
    expect(result['A2s']).toBe(1);
    expect(result['AKs']).toBe(1);
    // Offsuit
    expect(result['AJo']).toBe(1);
    expect(result['AKo']).toBe(1);
    expect(result['ATo']).toBeUndefined(); // not in range
    expect(result['KQo']).toBe(1);
    // Suited broadway
    expect(result['KTs']).toBe(1);
    expect(result['KQs']).toBe(1);
    expect(result['QTs']).toBe(1);
    expect(result['QJs']).toBe(1);
    expect(result['JTs']).toBe(1);
    expect(result['T9s']).toBe(1);
  });
});
