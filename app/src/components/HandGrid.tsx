import { useState, useEffect } from 'react';
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
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  return (
    <div 
      className={`range-grid-container size-${size}`}
      onContextMenu={(e) => onCellClick && e.preventDefault()}
    >
      {MATRIX.map((comboId) => {
        const actions = combos[comboId] ?? {};
        const activeActions = Object.entries(actions).filter(([, f]) => f > 0);
        
        let cumulativeHeight = 0;

        const handleInteraction = (e: React.MouseEvent) => {
          if (!onCellClick) return;
          // Right click = clear
          if (e.button === 2) {
            onCellClick(comboId, {}); 
          } else {
            onCellClick(comboId, actions);
          }
        };

        return (
          <div
            key={comboId}
            className={`hand-cell ${comboId.length === 2 ? 'pair' : comboId.endsWith('s') ? 'suited' : 'offsuit'}`}
            onMouseDown={(e) => {
              if (!onCellClick) return;
              setIsMouseDown(true);
              handleInteraction(e);
            }}
            onMouseEnter={(e) => {
              if (isMouseDown && onCellClick) handleInteraction(e);
            }}
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
