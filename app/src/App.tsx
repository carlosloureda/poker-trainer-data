import { useState, useEffect } from 'react';
import type { RangeCraftJSON, Position } from './core/models';
import { POSITIONS, POSITION_LABELS } from './core/models';
import { PositionPage } from './components/PositionPage';
import { useAppState } from './hooks/useAppState';

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onLogin }: { onLogin: (pw: string) => Promise<boolean> }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(pw);
    setLoading(false);
    if (!ok) { setError(true); setPw(''); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <form onSubmit={submit} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '2rem', width: 320 }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem', fontSize: '1.1rem' }}>♠ Poker Trainer</h2>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          placeholder="Contraseña"
          autoFocus
          style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0f172a', border: `1px solid ${error ? '#ef4444' : '#334155'}`, borderRadius: 6, color: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>Contraseña incorrecta</p>}
        <button type="submit" disabled={!pw || loading} style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ─── Strategy Library Sidebar ─────────────────────────────────────────────────
function LibrarySidebar({
  strategies, loadedStrategy, onLoad, onImport, onDelete
}: {
  strategies: { name: string }[];
  loadedStrategy: string | null;
  onLoad: (name: string) => void;
  onImport: (json: unknown, name: string) => void;
  onDelete: (name: string) => void;
}) {
  const [importing, setImporting] = useState(false);
  const [newName, setNewName] = useState('');
  const [pendingJson, setPendingJson] = useState<unknown>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        setPendingJson(json);
        setNewName(file.name.replace('.json', ''));
        setImporting(true);
      } catch { alert('JSON inválido'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmImport() {
    if (!pendingJson || !newName.trim()) return;
    onImport(pendingJson, newName.trim());
    setImporting(false);
    setPendingJson(null);
    setNewName('');
  }

  return (
    <div style={{ width: 200, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0.75rem', borderBottom: '1px solid #1e293b' }}>
        <p style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Estrategias</p>
        {strategies.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <button
              onClick={() => onLoad(s.name)}
              style={{ flex: 1, textAlign: 'left', padding: '0.4rem 0.5rem', background: loadedStrategy === s.name ? '#1e293b' : 'transparent', border: 'none', borderRadius: 4, color: loadedStrategy === s.name ? '#f8fafc' : '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', borderLeft: loadedStrategy === s.name ? '2px solid #3b82f6' : '2px solid transparent' }}
            >
              {s.name}
            </button>
            <button onClick={() => onDelete(s.name)} style={{ padding: '0.2rem 0.4rem', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>
        ))}
        {strategies.length === 0 && <p style={{ color: '#334155', fontSize: '0.75rem' }}>Sin estrategias</p>}
      </div>

      {importing ? (
        <div style={{ padding: '0.75rem' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" style={{ width: '100%', padding: '0.4rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#f8fafc', fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '0.5rem' }} />
          <button onClick={confirmImport} style={{ width: '100%', padding: '0.4rem', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Guardar</button>
          <button onClick={() => { setImporting(false); setPendingJson(null); }} style={{ width: '100%', padding: '0.4rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
        </div>
      ) : (
        <label style={{ margin: '0.75rem', padding: '0.4rem', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
          + Importar JSON
          <input type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { auth, login, strategies, loadedStrategy, positions, loadStrategy, deleteStrategy, importJSON, error } = useAppState();
  const [activePos, setActivePos] = useState<Position>('utg');

  useEffect(() => {
    if (positions && positions.length > 0) setActivePos(positions[0].position);
  }, [positions]);

  if (auth === 'checking') return <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>Cargando...</div>;
  if (auth === 'prompt') return <PasswordGate onLogin={login} />;

  const activeData = positions?.find((p) => p.position === activePos);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1.25rem', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>♠ Poker Trainer</span>
        {loadedStrategy && <span style={{ marginLeft: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{loadedStrategy}</span>}
        {error && <span style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '0.8rem' }}>{error}</span>}
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Strategy Library */}
        <LibrarySidebar
          strategies={strategies}
          loadedStrategy={loadedStrategy}
          onLoad={loadStrategy}
          onImport={(json, name) => importJSON(json as RangeCraftJSON, name)}
          onDelete={deleteStrategy}
        />

        {!positions ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <span>Selecciona o importa una estrategia</span>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Position tabs */}
            <nav style={{ width: 64, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', paddingTop: '0.5rem', flexShrink: 0 }}>
              {POSITIONS.map((pos) => {
                const exists = positions.some((p) => p.position === pos);
                const isActive = pos === activePos;
                return (
                  <button key={pos} onClick={() => exists && setActivePos(pos)} disabled={!exists} style={{ padding: '0.7rem 0', background: isActive ? '#1e293b' : 'transparent', border: 'none', borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent', color: isActive ? '#f8fafc' : exists ? '#64748b' : '#1e293b', cursor: exists ? 'pointer' : 'not-allowed', fontSize: '0.78rem', fontWeight: isActive ? 700 : 500 }}>
                    {POSITION_LABELS[pos]}
                  </button>
                );
              })}
            </nav>

            {/* Main content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {activeData ? <PositionPage data={activeData} /> : <p style={{ color: '#475569' }}>Sin datos para esta posición.</p>}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
