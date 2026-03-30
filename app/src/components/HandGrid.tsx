import type { ResolvedCombos } from '../core/models';
import { ACTION_COLORS } from '../core/models';
import { getHandMatrix } from '../core/pokerLogic';

const MATRIX = getHandMatrix();

interface HandGridProps {
  /** Resolved combos: comboId → { actionType: frequency } */
  combos: ResolvedCombos;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Called when a cell is clicked (optional — for read-only grids just omit) */
  onCellClick?: (comboId: string) => void;
}

const CELL_SIZE: Record<string, number> = { sm: 28, md: 40, lg: 52 };
const FONT_SIZE: Record<string, string> = { sm: '0.6rem', md: '0.75rem', lg: '0.85rem' };

export function HandGrid({ combos, size = 'md', onCellClick }: HandGridProps) {
  const cellPx = CELL_SIZE[size];
  const fontSize = FONT_SIZE[size];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(13, ${cellPx}px)`,
        gap: '2px',
        userSelect: 'none',
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {MATRIX.map((comboId) => {
        const actions = combos[comboId] ?? {};
        const activeActions = Object.entries(actions).filter(([, f]) => f > 0);
        const isEmpty = activeActions.length === 0;

        const isPair = comboId.length === 2;

        return (
          <div
            key={comboId}
            onClick={() => onCellClick?.(comboId)}
            style={{
              width: cellPx,
              height: cellPx,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid #334155',
              cursor: onCellClick ? 'pointer' : 'default',
              backgroundColor: isPair ? '#334155' : '#1e293b',
              flexShrink: 0,
            }}
          >
            {/* Action fill layers (bottom-up) */}
            {!isEmpty && (() => {
              let usedPct = 0;
              return activeActions.map(([actionId, freq]) => {
                const bottom = usedPct;
                usedPct += freq * 100;
                return (
                  <div
                    key={actionId}
                    style={{
                      position: 'absolute',
                      bottom: `${bottom}%`,
                      left: 0,
                      width: '100%',
                      height: `${freq * 100}%`,
                      backgroundColor: ACTION_COLORS[actionId] ?? '#64748b',
                    }}
                  />
                );
              });
            })()}

            {/* Label */}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize,
                fontWeight: 600,
                color: isEmpty ? '#475569' : '#f8fafc',
                textShadow: isEmpty ? 'none' : '0 1px 2px rgba(0,0,0,0.7)',
                lineHeight: 1,
              }}
            >
              {comboId}
            </span>
          </div>
        );
      })}
    </div>
  );
}
