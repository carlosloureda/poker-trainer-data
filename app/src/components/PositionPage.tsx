import { useState } from 'react';
import type { ResolvedPosition, ResolvedSituation, ResolvedCombos } from '../core/models';
import { ACTION_COLORS, POSITION_LABELS } from '../core/models';
import { HandGrid } from './HandGrid';

interface PositionPageProps {
  data: ResolvedPosition;
}

/** Small legend showing which color = which action */
function ActionLegend({ combos }: { combos: ResolvedCombos }) {
  const actions = new Set<string>();
  Object.values(combos).forEach((a) => Object.keys(a).forEach((k) => actions.add(k)));

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      {[...actions].map((a) => (
        <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: ACTION_COLORS[a] ?? '#64748b', display: 'inline-block' }} />
          {a.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
}

/** The expanded grid panel that appears when clicking a situation */
function SituationPanel({ situation, onClose }: { situation: ResolvedSituation; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div
        style={{ background: '#1e293b', borderRadius: 10, padding: '1.5rem', border: '1px solid #334155' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#f8fafc', margin: 0 }}>{situation.label}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
        <HandGrid combos={situation.combos} size="md" />
        <ActionLegend combos={situation.combos} />
      </div>
    </div>
  );
}

/** One card showing a small situation grid with its label */
function SituationCard({ situation, onClick }: { situation: ResolvedSituation; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1e293b' : '#0f172a',
        border: `1px solid ${hovered ? '#475569' : '#334155'}`,
        borderRadius: 8,
        padding: '0.75rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {situation.label}
      </p>
      <HandGrid combos={situation.combos} size="sm" />
    </div>
  );
}

export function PositionPage({ data }: PositionPageProps) {
  const [expandedSituation, setExpandedSituation] = useState<ResolvedSituation | null>(null);
  const label = POSITION_LABELS[data.position];

  return (
    <div>
      {/* Open range section */}
      {data.open && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            {label} Open Range (RFI)
          </h3>
          <HandGrid combos={data.open} size="lg" />
          <ActionLegend combos={data.open} />
        </section>
      )}

      {/* Response situations */}
      {data.situations.length > 0 && (
        <section>
          <h3 style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Respuestas desde {label}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
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
