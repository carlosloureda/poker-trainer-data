import { useState, useRef } from 'react';
import type { RangeCraftJSON, ResolvedPosition } from './core/models';
import { POSITIONS, POSITION_LABELS } from './core/models';
import { parseRangeCraftJSON } from './core/rangeAdapter';
import { PositionPage } from './components/PositionPage';
import './index.css';

export default function App() {
  const [positions, setPositions] = useState<ResolvedPosition[] | null>(null);
  const [activePos, setActivePos] = useState<string>('utg');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string) as RangeCraftJSON;
        const parsed = parseRangeCraftJSON(json);
        setPositions(parsed);
        setActivePos(parsed[0]?.position ?? 'utg');
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo leer el JSON. Comprueba el formato.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const activeData = positions?.find((p) => p.position === activePos);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', color: '#f8fafc' }}>
          ♠ Poker Trainer
        </span>
        <label style={{
          padding: '0.4rem 1rem', background: '#1e293b', border: '1px solid #334155',
          borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8',
        }}>
          Cargar JSON
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </header>

      {error && (
        <div style={{ margin: '1rem 1.5rem', padding: '0.75rem 1rem', background: '#450a0a', border: '1px solid #991b1b', borderRadius: 6, color: '#fca5a5', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {!positions ? (
        /* Empty state */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', gap: '1rem', color: '#475569' }}>
          <span style={{ fontSize: '3rem' }}>♠</span>
          <p style={{ fontSize: '1rem' }}>Carga un archivo JSON de rangos para empezar</p>
          <label style={{
            padding: '0.6rem 1.5rem', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 6, cursor: 'pointer', color: '#94a3b8',
          }}>
            Seleccionar archivo
            <input type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
          {/* Sidebar — position tabs */}
          <nav style={{
            width: 72, flexShrink: 0, borderRight: '1px solid #1e293b',
            display: 'flex', flexDirection: 'column', paddingTop: '0.5rem',
          }}>
            {POSITIONS.map((pos) => {
              const exists = positions.some((p) => p.position === pos);
              const isActive = pos === activePos;
              return (
                <button
                  key={pos}
                  onClick={() => exists && setActivePos(pos)}
                  disabled={!exists}
                  style={{
                    padding: '0.75rem 0',
                    background: isActive ? '#1e293b' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                    color: isActive ? '#f8fafc' : exists ? '#64748b' : '#334155',
                    cursor: exists ? 'pointer' : 'not-allowed',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.05em',
                    transition: 'all 0.1s',
                  }}
                >
                  {POSITION_LABELS[pos]}
                </button>
              );
            })}
          </nav>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
            {activeData ? (
              <>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
                  {POSITION_LABELS[activeData.position]}
                </h2>
                <PositionPage data={activeData} />
              </>
            ) : (
              <p style={{ color: '#475569' }}>Sin datos para esta posición.</p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
