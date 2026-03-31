import { useState, useEffect } from 'react';
import type { RangeCraftJSON, Position } from './core/models';
import { POSITIONS, POSITION_LABELS } from './core/models';
import { PositionPage } from './components/PositionPage';
import { QuickView } from './components/QuickView';
import { useAppState } from './hooks/useAppState';
import './index.css';

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
    <div className="modal-overlay" style={{ background: 'var(--bg)' }}>
      <form onSubmit={submit} style={{ padding: '2rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, width: 320 }}>
        <h2 style={{ color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>♠ Poker Trainer</h2>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          placeholder="Contraseña"
          autoFocus
          className="quick-select"
          style={{ width: '100%' }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>Contraseña incorrecta</p>}
        <button type="submit" disabled={!pw || loading} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ─── Strategy Library ─────────────────────────────────────────────────────────
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
    <div className="library-sidebar" style={{ padding: '1rem' }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Estrategias</p>
      <div style={{ flex: 1 }}>
        {strategies.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <button
              onClick={() => onLoad(s.name)}
              className="btn"
              style={{ flex: 1, textAlign: 'left', border: 'none', background: loadedStrategy === s.name ? 'var(--panel)' : 'transparent', color: loadedStrategy === s.name ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {s.name}
            </button>
            <button onClick={() => onDelete(s.name)} style={{ padding: '0.2rem 0.4rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>
        ))}
        {strategies.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>No hay estrategias.</p>}
      </div>

      {importing ? (
        <div style={{ marginTop: '1rem' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" className="quick-select" style={{ width: '100%', marginBottom: '0.5rem' }} />
          <button onClick={confirmImport} className="btn btn-primary" style={{ width: '100%', marginBottom: '0.3rem' }}>Guardar</button>
          <button onClick={() => setImporting(false)} className="btn" style={{ width: '100%' }}>Cancelar</button>
        </div>
      ) : (
        <label className="btn" style={{ marginTop: 'auto', textAlign: 'center' }}>
          + Importar
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
  const [view, setView] = useState<'study' | 'quick'>('study');

  useEffect(() => {
    if (positions && positions.length > 0) {
       // Only set the first position if current one isn't available
       if (!positions.some(p => p.position === activePos)) {
         setActivePos(positions[0].position as Position);
       }
    }
  }, [positions]);

  if (auth === 'checking') return <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Iniciando...</div>;
  if (auth === 'prompt') return <PasswordGate onLogin={login} />;

  const activeData = positions?.find((p) => p.position === activePos);

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-header__logo">♠ Poker Trainer</span>
        {loadedStrategy && <span className="app-header__strategy">{loadedStrategy}</span>}
        
        <div className="view-switcher">
          <button className={view === 'study' ? 'active' : ''} onClick={() => setView('study')}>Estudio</button>
          <button className={view === 'quick' ? 'active' : ''} onClick={() => setView('quick')}>Quick View</button>
        </div>

        {error && <span className="app-header__error">{error}</span>}
      </header>

      <div className="app-body">
        <LibrarySidebar
          strategies={strategies}
          loadedStrategy={loadedStrategy}
          onLoad={loadStrategy}
          onImport={(json, name) => importJSON(json as RangeCraftJSON, name)}
          onDelete={deleteStrategy}
        />

        <div className="content-panel">
          {!positions ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              <span>Selecciona una estrategia para empezar</span>
            </div>
          ) : (
            <>
              {view === 'study' ? (
                <>
                  <nav className="pos-tabs">
                    {POSITIONS.map((pos) => {
                      const exists = positions.some((p) => p.position === pos);
                      const isActive = pos === activePos;
                      return (
                        <button 
                          key={pos} 
                          onClick={() => exists && setActivePos(pos)} 
                          disabled={!exists}
                          className={`pos-tab ${isActive ? 'active' : ''}`}
                        >
                          {POSITION_LABELS[pos] || pos.toUpperCase()}
                        </button>
                      );
                    })}
                  </nav>
                  <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {activeData ? <PositionPage data={activeData} /> : <div className="main-scroll">Sin datos.</div>}
                  </main>
                </>
              ) : (
                <QuickView positions={positions} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
