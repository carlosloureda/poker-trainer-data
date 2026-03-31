import { useState } from 'react';
import type { ResolvedPosition } from '../core/models';
import { POSITION_LABELS, ACTION_COLORS } from '../core/models';
import { situationLabel, actionLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface QuickViewProps {
  positions: ResolvedPosition[];
}

export function QuickView({ positions }: QuickViewProps) {
  const [activePos, setActivePos] = useState<string>(positions[0]?.position || 'utg');
  const [activeSitKey, setActiveSitKey] = useState<string>('open');

  const posData = positions.find(p => p.position === activePos);
  
  // Combine open with other situations for the dropdown
  const availableSituations = [
    ...(posData?.open ? [{ key: 'open', label: 'Open Range (RFI)' }] : []),
    ...(posData?.situations.map(s => ({ key: s.key, label: situationLabel(s.key) })) || [])
  ];

  const currentCombos = activeSitKey === 'open' 
    ? posData?.open 
    : posData?.situations.find(s => s.key === activeSitKey)?.combos;

  return (
    <div className="quick-view">
      <div className="quick-selectors">
        <select 
          className="quick-select"
          value={activePos} 
          onChange={(e) => {
            setActivePos(e.target.value);
            setActiveSitKey('open'); // reset situation when changing position
          }}
        >
          {positions.map(p => (
            <option key={p.position} value={p.position}>
              Yo soy: {POSITION_LABELS[p.position]}
            </option>
          ))}
        </select>

        <select 
          className="quick-select"
          value={activeSitKey} 
          onChange={(e) => setActiveSitKey(e.target.value)}
        >
          {availableSituations.map(s => (
            <option key={s.key} value={s.key}>
              Sit: {s.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {currentCombos ? (
          <>
            <HandGrid combos={currentCombos} size="lg" />
            <div style={{ marginTop: '1rem', background: 'var(--panel)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
               {/* Simplified Legend items always visible */}
               <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Acciones</h4>
               <div className="action-legend">
                 {Object.values(currentCombos).reduce((acc: string[], val) => {
                    Object.keys(val).forEach(k => { if(!acc.includes(k)) acc.push(k); });
                    return acc;
                 }, []).map(action => (
                    <div key={action} className="action-legend__item">
                      <div className="action-legend__dot" style={{ backgroundColor: ACTION_COLORS[action] || '#ef4444' }} />
                      <span style={{ fontSize: '0.75rem' }}>{actionLabel(action)}</span>
                    </div>
                 ))}
               </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-dim)' }}>No hay datos para esta combinación.</p>
        )}
      </div>
    </div>
  );
}
