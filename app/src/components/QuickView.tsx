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

  // Always reset/select the first situation when position changes
  useEffect(() => {
    if (posData && posData.situations.length > 0) {
      // Find what would be the first situation to show
      setActiveSit(posData.situations[0].key);
    }
  }, [activePos, setActiveSit]); // Triggered when position changes

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
