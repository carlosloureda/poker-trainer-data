import type { ResolvedCombos } from '../core/models';
import { ACTION_COLORS } from '../core/models';
import { getHandMatrix } from '../core/pokerLogic';

const MATRIX = getHandMatrix();

interface HandGridProps {
  combos: ResolvedCombos;
  size?: 'sm' | 'md' | 'lg' | 'auto';
  onCellClick?: (comboId: string, actions: Record<string, number>) => void;
}

export function HandGrid({ combos, size = 'md', onCellClick }: HandGridProps) {
  return (
    <div className={`range-grid-container size-${size}`}>
      {MATRIX.map((comboId) => {
        const actions = combos[comboId] ?? {};
        const activeActions = Object.entries(actions).filter(([, f]) => f > 0);
        
        let cumulativeHeight = 0;

        return (
          <div
            key={comboId}
            className={`hand-cell ${comboId.length === 2 ? 'pair' : comboId.endsWith('s') ? 'suited' : 'offsuit'}`}
            onClick={() => onCellClick?.(comboId, actions)}
            style={{
              width: 'var(--cell)',
              height: 'var(--cell)',
              fontSize: 'var(--cell-font)',
              cursor: onCellClick ? 'pointer' : 'default',
            }}
          >
            {activeActions.map(([action, freq]) => {
              const height = freq * 100;
              const bottom = cumulativeHeight;
              cumulativeHeight += height;
              
              return (
                <div 
                  key={action}
                  className="hand-fill" 
                  style={{ 
                    backgroundColor: ACTION_COLORS[action] || '#64748b',
                    height: `${height}%`,
                    bottom: `${bottom}%` 
                  }} 
                />
              );
            })}

            <span className="hand-label">{comboId}</span>
          </div>
        );
      })}
    </div>
  );
}
