import { useMemo, useEffect } from 'react';
import type { ResolvedPosition } from '../core/models';
import { POSITIONS, POSITION_LABELS, ACTION_COLORS } from '../core/models';
import { actionLabel, situationLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface QuickViewProps {
  positions: ResolvedPosition[];
  activePos: string;
  setActivePos: (p: string) => void;
  activeSit: string;
  setActiveSit: (s: string) => void;
}

export function QuickView({ 
  positions, 
  activePos, 
  setActivePos, 
  activeSit, 
  setActiveSit 
}: QuickViewProps) {
  const posData = useMemo(() => positions.find(p => p.position === activePos), [positions, activePos]);

  // Reset/Select situation if invalid for new position
  useEffect(() => {
    // 1. If current situation doesn't exist for the new position, reset it
    const isValid = activeSit === 'open' ? !!posData?.open : !!posData?.situations.find(s => s.key === activeSit);
    
    if (!isValid) {
      if (posData?.open) {
        setActiveSit('open');
      } else if (posData?.situations.length) {
        // Fallback to the first available situation (crucial for BB)
        setActiveSit(posData.situations[0].key);
      }
    }
  }, [activePos, posData, activeSit, setActiveSit]);

  const currentSituation = useMemo(() => {
    if (activeSit === 'open') return posData?.open;
    return posData?.situations.find(s => s.key === activeSit);
  }, [posData, activeSit]);

  const currentCombos = useMemo(() => currentSituation?.combos, [currentSituation]);

  const activeActions = useMemo(() => {
    return currentSituation?.allowedActions || [];
  }, [currentSituation]);

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
                 onClick={() => setActivePos(p)}
                 className={`play-btn ${activePos === p ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}
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
          {posData?.situations.map(sit => (
            <button 
              key={sit.key} 
              onClick={() => setActiveSit(sit.key)}
              className={`play-btn ${activeSit === sit.key ? 'active' : ''}`}
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
                <div key={a} className="action-legend__item is-static">
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
