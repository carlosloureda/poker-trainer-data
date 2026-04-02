import { useState, useMemo, useEffect } from 'react';
import type { ResolvedPosition } from '../core/models';
import { ACTION_COLORS, POSITIONS, POSITION_LABELS } from '../core/models';
import { actionLabel, situationLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface PositionPageProps {
  positions: ResolvedPosition[];
  activePos: string;
  setActivePos: (p: string) => void;
  activeSit: string;
  setActiveSit: (s: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (updated: ResolvedPosition) => void;
}

export function PositionPage({ 
  positions, 
  activePos, 
  setActivePos, 
  activeSit, 
  setActiveSit, 
  isEditing, 
  onToggleEdit, 
  onUpdate 
}: PositionPageProps) {
  const [paintAction, setPaintAction] = useState<string>('open');
  
  const posData = useMemo(() => positions.find(p => p.position === activePos), [positions, activePos]);
  
  // Reset/Select situation if invalid for new position
  useEffect(() => {
    const isValid = activeSit === 'open' ? !!posData?.open : !!posData?.situations.find(s => s.key === activeSit);
    
    if (!isValid) {
      if (posData?.open) {
        setActiveSit('open');
      } else if (posData?.situations.length) {
        setActiveSit(posData.situations[0].key);
      }
    }
  }, [activePos, posData, activeSit, setActiveSit]);

  const currentSituation = useMemo(() => {
    if (activeSit === 'open') return posData?.open || null;
    return posData?.situations.find(s => s.key === activeSit) || null;
  }, [posData, activeSit]);

  const activeActions = useMemo(() => {
    return currentSituation?.allowedActions || ['open'];
  }, [currentSituation]);

  // Ensure paintAction is valid for the current situation
  useEffect(() => {
    if (!activeActions.includes(paintAction)) {
      setPaintAction(activeActions[0]);
    }
  }, [activeActions, paintAction]);

  const handleCellClick = (hand: string) => {
    if (!isEditing || !posData || !currentSituation) return;
    
    const newCombos = { ...currentSituation.combos };
    
    // Toggle logic: if already painted with the current paintAction, remove it (fold)
    if (newCombos[hand] && newCombos[hand][paintAction]) {
      delete newCombos[hand];
    } else {
      // Otherwise, paint it with the current action (overwriting any previous action)
      newCombos[hand] = { [paintAction]: 1 };
    }

    const updatedSituation = { ...currentSituation, combos: newCombos };
    
    if (activeSit === 'open') {
      onUpdate({ ...posData, open: updatedSituation, situations: posData.situations.map(s => s.key === 'open' ? updatedSituation : s) });
    } else {
      const newSits = posData.situations.map(s => s.key === activeSit ? updatedSituation : s);
      onUpdate({ ...posData, situations: newSits });
    }
  };

  return (
    <div className="quick-view studio-view">
      {/* HEADER TOOLS */}
      <div className="studio-header">
         <button onClick={onToggleEdit} className={`btn ${isEditing ? 'btn-primary' : ''}`}>
           {isEditing ? '✓ Finalizar Edición' : '✎ Editar Rangos'}
         </button>
      </div>

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

      {/* SITUATION Selector */}
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
        <div className="play-result-container">
          <HandGrid 
            combos={currentSituation?.combos || {}} 
            size="lg" 
            onCellClick={isEditing ? handleCellClick : undefined}
          />
          
          <div className="play-legend studio-legend">
            <p className="legend-title">{isEditing ? 'PINCEL DE ACCIÓN:' : 'LEYENDA:'}</p>
            <div className="action-legend">
              {activeActions.map(a => (
                <div 
                  key={a} 
                  className={`action-legend__item ${isEditing && paintAction === a ? 'active-paint' : ''} ${isEditing ? 'editable' : 'is-static'}`}
                  onClick={() => isEditing && setPaintAction(a)}
                >
                  <div className="action-legend__dot" style={{ backgroundColor: ACTION_COLORS[a] }} />
                  <span style={{ fontWeight: 700 }}>{actionLabel(a)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
