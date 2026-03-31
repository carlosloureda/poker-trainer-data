import type { ResolvedCombos } from '../core/models';
import { ACTION_COLORS } from '../core/models';
import { getHandMatrix } from '../core/pokerLogic';

const MATRIX = getHandMatrix();

interface HandGridProps {
  /** Resolved combos: comboId → { actionType: frequency } */
  combos: ResolvedCombos;
  /** Size variant: sm, md, lg or 'auto' for responsive */
  size?: 'sm' | 'md' | 'lg' | 'auto';
  /** Called when a cell is clicked */
  onCellClick?: (comboId: string) => void;
}

export function HandGrid({ combos, size = 'md', onCellClick }: HandGridProps) {
  // We use CSS variables defined in index.css, but we can override them locally if needed via inline style
  const sizeStyles: Record<string, any> = {
    sm: { '--cell': '24px', '--cell-font': '0.55rem' },
    md: { '--cell': '34px', '--cell-font': '0.7rem' },
    lg: { '--cell': '44px', '--cell-font': '0.85rem' },
    auto: {} // Uses global media query defaults
  };

  return (
    <div
      className="range-grid-container"
      style={{
        ...sizeStyles[size],
        display: 'grid',
        gridTemplateColumns: 'repeat(13, var(--cell))',
        gap: '1px',
        width: 'fit-content'
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
            className={`hand-cell ${isPair ? 'pair' : comboId.endsWith('s') ? 'suited' : 'offsuit'}`}
            onClick={() => onCellClick?.(comboId)}
            style={{
              width: 'var(--cell)',
              height: 'var(--cell)',
              fontSize: 'var(--cell-font)',
              cursor: onCellClick ? 'pointer' : 'default',
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
                    className="hand-fill"
                    style={{
                      height: `${freq * 100}%`,
                      backgroundColor: ACTION_COLORS[actionId] ?? '#64748b',
                      bottom: `${bottom}%`
                    }}
                  />
                );
              });
            })()}

            <span className="hand-label">{comboId}</span>
          </div>
        );
      })}
    </div>
  );
}
