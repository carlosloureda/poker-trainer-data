/** Maps raw action keys from the JSON to human-readable labels */
export const ACTION_LABELS: Record<string, string> = {
  open:              'Open (RFI)',
  '3bet_5bet_shove': '3bet / 5bet shove',
  '3bet_fold':       '3bet fold (bluff)',
  call_open:         'Call open',
  '4bet_6bet':       '4bet / 6bet',
  '4bet_fold':       '4bet fold (bluff)',
  call_3bet:         'Call 3bet',
  squeeze:           'Squeeze',
};

/** Returns the readable label for an action key, falling back to a prettified version */
export function actionLabel(key: string): string {
  return ACTION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Maps raw situation keys to human-readable labels */
export function situationLabel(key: string): string {
  if (key === 'open') return 'OPEN (RFI)';
  return key
    .replace(/_vs_/g, ' vs ')
    .replace(/_/g, ' ')
    .replace(/\b(utg|hj|co|btn|sb|bb)\b/gi, m => m.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}
