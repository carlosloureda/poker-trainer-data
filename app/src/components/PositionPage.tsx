import { useState } from 'react';
import type { ResolvedPosition, ResolvedSituation, ResolvedCombos } from '../core/models';
import { ACTION_COLORS, POSITION_LABELS } from '../core/models';
import { actionLabel, situationLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface PositionPageProps {
  data: ResolvedPosition;
}

/** Small legend showing which color = which action */
function ActionLegend({ combos }: { combos: ResolvedCombos }) {
  const actions = new Set<string>();
  Object.values(combos).forEach((a) => Object.keys(a).forEach((k) => actions.add(k)));

  return (
    <div className="action-legend">
      {[...actions].map((a) => (
        <div key={a} className="action-legend__item">
          <div className="action-legend__dot" style={{ backgroundColor: ACTION_COLORS[a] ?? '#64748b' }} />
          {actionLabel(a)}
        </div>
      ))}
    </div>
  );
}

/** The expanded grid panel that appears when clicking a situation */
function SituationPanel({ situation, onClose }: { situation: ResolvedSituation; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{situationLabel(situation.key)}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <HandGrid combos={situation.combos} size="lg" />
        <ActionLegend combos={situation.combos} />
      </div>
    </div>
  );
}

/** One card showing a small situation grid with its label */
function SituationCard({ situation, onClick }: { situation: ResolvedSituation; onClick: () => void }) {
  return (
    <div className="situation-card" onClick={onClick}>
      <p className="situation-card__label">
        {situationLabel(situation.key)}
      </p>
      <HandGrid combos={situation.combos} size="sm" />
    </div>
  );
}

export function PositionPage({ data }: PositionPageProps) {
  const [expandedSituation, setExpandedSituation] = useState<ResolvedSituation | null>(null);
  const label = POSITION_LABELS[data.position];

  return (
    <div className="main-scroll">
      {/* Open range section */}
      {data.open && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 className="section-title">
            {label} Open Range (RFI)
          </h2>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <HandGrid combos={data.open} size="lg" />
            <div style={{ marginTop: '0.5rem' }}>
               <ActionLegend combos={data.open} />
               <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                 Este es tu rango estándar de apertura desde esta posición cuando nadie ha entrado en el bote.
               </p>
            </div>
          </div>
        </section>
      )}

      {/* Response situations */}
      {data.situations.length > 0 && (
        <section>
          <h2 className="section-title">
            Respuestas desde {label}
          </h2>
          <div className="situation-grid">
            {data.situations.map((sit) => (
              <SituationCard key={sit.key} situation={sit} onClick={() => setExpandedSituation(sit)} />
            ))}
          </div>
        </section>
      )}

      {/* Expanded modal */}
      {expandedSituation && (
        <SituationPanel situation={expandedSituation} onClose={() => setExpandedSituation(null)} />
      )}
    </div>
  );
}
