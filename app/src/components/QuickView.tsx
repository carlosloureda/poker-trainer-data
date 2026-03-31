import { useState, useMemo, useEffect } from 'react';
import type { ResolvedPosition } from '../core/models';
import { POSITIONS, POSITION_LABELS, ACTION_COLORS } from '../core/models';
import { actionLabel, situationLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface QuickViewProps {
  positions: ResolvedPosition[];
}

export function QuickView({ positions }: QuickViewProps) {
  const [myPos, setMyPos] = useState<string>('utg');
  const [activeSitKey, setActiveSitKey] = useState<string>('open');

  const posData = useMemo(() => positions.find(p => p.position === myPos), [positions, myPos]);

  // Reset to 'open' (or first available) when position changes
  useEffect(() => {
    if (posData?.open) {
      setActiveSitKey('open');
    } else if (posData?.situations.length) {
      setActiveSitKey(posData.situations[0].key);
    }
  }, [myPos, posData]);

  const currentCombos = useMemo(() => {
    if (activeSitKey === 'open') return posData?.open;
    return posData?.situations.find(s => s.key === activeSitKey)?.combos;
  }, [posData, activeSitKey]);

  const activeActions = useMemo(() => {
    if (!currentCombos) return [];
    const actions = new Set<string>();
    Object.values(currentCombos).forEach(v => Object.keys(v).forEach(k => actions.add(k)));
    return Array.from(actions);
  }, [currentCombos]);

  return (
    <div className="quick-view">
      {/* POSITION Selector */}
      <div className="play-selector-group">
        <span className="play-selector-label">MI POSICIÓN:</span>
        <div className="play-buttons">
          {POSITIONS.map(p => {
             const hasData = positions.some(pos => pos.position === p);
             return (
               <button 
                 key={p} 
                 onClick={() => setMyPos(p)}
                 className={`play-btn ${myPos === p ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
                 disabled={!hasData}
               >
                 {POSITION_LABELS[p]}
               </button>
             );
          })}
        </div>
      </div>

      {/* DYNAMIC SITUATION Selector */}
      <div className="play-selector-group">
        <span className="play-selector-label">SITUACIÓN:</span>
        <div className="play-buttons">
          {posData?.open && (
            <button 
              onClick={() => setActiveSitKey('open')}
              className={`play-btn ${activeSitKey === 'open' ? 'active' : ''}`}
            >
              OPEN (RFI)
            </button>
          )}
          {posData?.situations.map(sit => (
            <button 
              key={sit.key} 
              onClick={() => setActiveSitKey(sit.key)}
              className={`play-btn ${activeSitKey === sit.key ? 'active' : ''}`}
            >
              {situationLabel(sit.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="play-result">
        {currentCombos ? (
          <div className="play-result-container">
            <HandGrid combos={currentCombos} size="lg" />
            <div className="play-legend">
              {activeActions.map(a => (
                <div key={a} className="action-legend__item">
                  <div className="action-legend__dot" style={{ backgroundColor: ACTION_COLORS[a] }} />
                  <span style={{ fontWeight: 700 }}>{actionLabel(a)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="play-empty">
            <p>Selecciona una situación para ver la tabla.</p>
          </div>
        )}
      </div>
    </div>
  );
}
