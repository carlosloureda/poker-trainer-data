import { useState } from 'react';
import type { ResolvedPosition, ResolvedSituation, ResolvedCombos } from '../core/models';
import { ACTION_COLORS, POSITION_LABELS } from '../core/models';
import { actionLabel, situationLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface PositionPageProps {
  data: ResolvedPosition;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (updated: ResolvedPosition) => void;
}

/** Legend that also acts as an action selector in edit mode */
function ActionPalette({ 
  combos, 
  onSelect, 
  selected, 
  isEditing 
}: { 
  combos: ResolvedCombos, 
  onSelect?: (a: string) => void, 
  selected?: string, 
  isEditing: boolean 
}) {
  const actions = new Set<string>(['open', '3bet', 'call', 'fold', '4bet', '5bet', 'shove']);
  // Add any existing custom actions from combos
  Object.values(combos).forEach((a) => Object.keys(a).forEach((k) => actions.add(k)));

  return (
    <div className="action-legend">
      {[...actions].map((a) => (
        <div 
          key={a} 
          className={`action-legend__item ${selected === a ? 'active-paint' : ''} ${isEditing ? 'editable' : ''}`}
          onClick={() => isEditing && onSelect?.(a)}
          style={{ 
            cursor: isEditing ? 'pointer' : 'default',
            border: selected === a ? `2px solid ${ACTION_COLORS[a] || '#fff'}` : '2px solid transparent',
            padding: '2px 8px',
            borderRadius: '6px'
          }}
        >
          <div className="action-legend__dot" style={{ backgroundColor: ACTION_COLORS[a] ?? '#64748b' }} />
          {actionLabel(a)}
        </div>
      ))}
    </div>
  );
}

/** Expanded modal with editing capabilities */
function SituationPanel({ 
  situation, 
  isEditing, 
  onClose, 
  onUpdate 
}: { 
  situation: ResolvedSituation; 
  isEditing: boolean;
  onClose: () => void;
  onUpdate: (combos: ResolvedCombos) => void;
}) {
  const [paintAction, setPaintAction] = useState<string>('3bet');
  const [localCombos, setLocalCombos] = useState<ResolvedCombos>(JSON.parse(JSON.stringify(situation.combos)));

  const handleCellClick = (hand: string, current: Record<string, number>) => {
    if (!isEditing) return;
    const newCombos = { ...localCombos };
    if (paintAction === 'fold' || Object.keys(current).length === 0) {
       delete newCombos[hand];
    } else {
       newCombos[hand] = { [paintAction]: 1 };
    }
    setLocalCombos(newCombos);
  };

  return (
    <div className="modal-overlay" onClick={() => {
       if (isEditing) {
          if (confirm('¿Guardar cambios en esta situación?')) onUpdate(localCombos);
       }
       onClose();
    }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ minWidth: '600px' }}>
        <div className="modal-header">
          <h3>{situationLabel(situation.key)} {isEditing && '(EDITANDO)'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
          <HandGrid 
            combos={localCombos} 
            size="lg" 
            onCellClick={isEditing ? handleCellClick : undefined} 
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {isEditing ? 'Pincel activo: Elige un color debajo y pinta en el grid.' : 'Vista de consulta.'}
            </p>
            <ActionPalette 
              combos={localCombos} 
              isEditing={isEditing} 
              selected={paintAction} 
              onSelect={setPaintAction} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SituationCard({ situation, onClick }: { situation: ResolvedSituation; onClick: () => void }) {
  return (
    <div className="situation-card" onClick={onClick}>
      <p className="situation-card__label">{situationLabel(situation.key)}</p>
      <HandGrid combos={situation.combos} size="sm" />
    </div>
  );
}

export function PositionPage({ data, isEditing, onToggleEdit, onUpdate }: PositionPageProps) {
  const [expandedSituation, setExpandedSituation] = useState<ResolvedSituation | null>(null);
  const label = POSITION_LABELS[data.position];

  const handleOpenUpdate = (newCombos: ResolvedCombos) => {
    onUpdate({ ...data, open: newCombos });
  };

  const handleSitUpdate = (key: string, newCombos: ResolvedCombos) => {
    const newSits = data.situations.map(s => s.key === key ? { ...s, combos: newCombos } : s);
    onUpdate({ ...data, situations: newSits });
  };

  const addSituation = () => {
    const key = prompt('Nombre de la situación (ej: vs_utg, 4bet_vs_btn):');
    if (!key) return;
    if (data.situations.some(s => s.key === key)) return alert('Ya existe');
    
    const newSit: ResolvedSituation = {
      key,
      label: situationLabel(key),
      combos: {}
    };
    onUpdate({ ...data, situations: [...data.situations, newSit] });
    setExpandedSituation(newSit);
  };

  return (
    <div className="main-scroll">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{label} Studio</h1>
        <button 
          onClick={onToggleEdit} 
          className={`btn ${isEditing ? 'btn-primary' : ''}`}
          style={{ padding: '0.6rem 1.2rem', fontWeight: 700 }}
        >
          {isEditing ? '✓ Finalizar Edición' : '✎ Editar Rangos'}
        </button>
      </div>

      {/* RFI Section */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--panel)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 className="section-title">Open Range (RFI)</h2>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <HandGrid 
            combos={data.open || {}} 
            size="lg" 
            onCellClick={isEditing ? (h) => {
              const newCombos = { ...(data.open || {}) };
              if (newCombos[h]) delete newCombos[h]; else newCombos[h] = { open: 1 };
              handleOpenUpdate(newCombos);
            } : undefined}
          />
          <div style={{ maxWidth: '300px' }}>
            <ActionPalette combos={data.open || {}} isEditing={false} />
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isEditing ? 'Haz click en las manos para activarlas/desactivarlas del rango de apertura.' : 'Tu rango estándar de apertura.'}
            </p>
          </div>
        </div>
      </section>

      {/* Response Situations */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Respuestas y Defensa</h2>
          {isEditing && (
            <button onClick={addSituation} className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
              + Añadir Situación
            </button>
          )}
        </div>
        <div className="situation-grid">
          {data.situations.map((sit) => (
            <SituationCard key={sit.key} situation={sit} onClick={() => setExpandedSituation(sit)} />
          ))}
          {data.situations.length === 0 && !isEditing && <p style={{ color: 'var(--text-dim)' }}>No hay situaciones configuradas.</p>}
        </div>
      </section>

      {expandedSituation && (
        <SituationPanel 
          situation={expandedSituation} 
          isEditing={isEditing}
          onClose={() => setExpandedSituation(null)} 
          onUpdate={(newCombos) => handleSitUpdate(expandedSituation.key, newCombos)}
        />
      )}
    </div>
  );
}
