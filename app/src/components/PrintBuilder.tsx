import { useState, useMemo } from 'react';
import type { ResolvedPosition } from '../core/models';
import { ACTION_COLORS } from '../core/models';
import { actionLabel } from '../core/labels';
import { HandGrid } from './HandGrid';

interface PrintBuilderProps {
  positions: ResolvedPosition[];
  strategyName: string;
}

export function PrintBuilder({ positions, strategyName }: PrintBuilderProps) {
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [scale, setScale] = useState(0.85);
  const [cols, setCols] = useState(2);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showSettings, setShowSettings] = useState(false);
  
  // Flatten all situations from all positions
  const allBlocks = useMemo(() => {
    const blocks: { pos: string; sit: string; combos: any; actions: string[] }[] = [];
    positions.forEach(p => {
      if (p.open) blocks.push({ pos: p.position, sit: 'open', combos: p.open.combos, actions: p.open.allowedActions });
      p.situations.forEach(s => {
        if (s.key !== 'open') blocks.push({ pos: p.position, sit: s.key, combos: s.combos, actions: s.allowedActions });
      });
    });
    return blocks;
  }, [positions]);

  // Chunk blocks into pages
  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < allBlocks.length; i += itemsPerPage) {
      p.push(allBlocks.slice(i, i + itemsPerPage));
    }
    return p;
  }, [allBlocks, itemsPerPage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-builder" style={{ '--page-scale': scale } as React.CSSProperties}>
      {/* DESKTOP TOOLBAR */}
      <div className="print-toolbar desktop-only no-print">
        <div className="print-toolbar__controls">
            <div className="toolbar-group">
              <label>Página:</label>
              <button className={`print-btn ${layout === 'portrait' ? 'active' : ''}`} onClick={() => setLayout('portrait')}>Vertical</button>
              <button className={`print-btn ${layout === 'landscape' ? 'active' : ''}`} onClick={() => setLayout('landscape')}>Horizontal</button>
            </div>

            <div className="toolbar-group">
              <label>Columnas:</label>
              {[1, 2, 3].map(c => (
                <button key={c} className={`print-btn ${cols === c ? 'active' : ''}`} onClick={() => setCols(c)}>{c}</button>
              ))}
            </div>

            <div className="toolbar-group">
              <label>Bloques x Pág:</label>
              <input 
                type="number" 
                className="print-input"
                min="1" 
                max="20" 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(parseInt(e.target.value) || 6)} 
              />
            </div>
            
            <div className="toolbar-group">
              <label>Zoom Master: {Math.round(scale * 100)}%</label>
              <input 
                type="range" 
                min="0.3" 
                max="1.5" 
                step="0.05" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))} 
              />
            </div>
        </div>

        <div className="print-toolbar__actions">
          <button className="print-btn primary" onClick={handlePrint}>
            🖨️ Generar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* MOBILE HEADER/BAR */}
      <div className="print-mobile-bar mobile-only no-print">
          <div className="mobile-bar-title">{strategyName}</div>
          <div className="mobile-bar-actions">
            <button className="print-btn" onClick={() => setShowSettings(!showSettings)}>⚙️ Ajustes</button>
            <button className="print-btn primary" onClick={handlePrint}>🖨️ Imprimir</button>
          </div>
      </div>

      {/* MOBILE SETTINGS DRAWER */}
      {showSettings && (
        <div className="mobile-settings-overlay no-print" onClick={() => setShowSettings(false)}>
            <div className="mobile-settings-drawer" onClick={e => e.stopPropagation()}>
               <div className="drawer-header">
                  <h3>Ajustes de Impresión</h3>
                  <button className="drawer-close" onClick={() => setShowSettings(false)}>✕</button>
               </div>
               
               <div className="drawer-content">
                  <div className="drawer-group">
                    <label>Orientación de Página</label>
                    <div className="drawer-actions">
                      <button className={`print-btn ${layout === 'portrait' ? 'active' : ''}`} onClick={() => setLayout('portrait')}>Vertical</button>
                      <button className={`print-btn ${layout === 'landscape' ? 'active' : ''}`} onClick={() => setLayout('landscape')}>Horizontal</button>
                    </div>
                  </div>

                  <div className="drawer-group">
                    <label>Columnas del Grid</label>
                    <div className="drawer-actions">
                      {[1, 2, 3].map(c => (
                        <button key={c} className={`print-btn ${cols === c ? 'active' : ''}`} onClick={() => setCols(c)}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="drawer-group">
                    <label>Rangos por Página</label>
                    <input 
                      type="number" 
                      className="print-input" 
                      value={itemsPerPage} 
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value) || 6)} 
                    />
                  </div>

                  <div className="drawer-group">
                    <label>Zoom Previsualización: {Math.round(scale * 100)}%</label>
                    <input 
                      type="range" 
                      min="0.3" 
                      max="1.5" 
                      step="0.05" 
                      value={scale} 
                      style={{ width: '100%' }}
                      onChange={(e) => setScale(parseFloat(e.target.value))} 
                    />
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* A4 CANVAS AREA */}
      <div className="print-canvas-area">
        {pages.map((blocks, pageIdx) => (
          <div key={pageIdx} className={`print-page ${layout}`}>
            <header className="print-page__header">
                <h3>{strategyName}</h3>
                <p>RangeCraft Studio · Pág. {pageIdx + 1}</p>
            </header>

            <div className={`print-grid cols-${cols}`}>
              {blocks.map((block, idx) => (
                <div key={idx} className="print-block">
                  <div className="print-block__info">
                    <span className="print-pos-label">{block.pos.toUpperCase()}</span>
                    <span className="print-sit-label">{block.sit.replace(/_/g, ' ')}</span>
                  </div>
                  
                  <div className="print-block__visual" style={{ transform: `scale(var(--page-scale))`, transformOrigin: 'top left' }}>
                    <HandGrid combos={block.combos} size="sm" />
                    
                    <div className="print-block__legend">
                       {block.actions.map(a => (
                         <div key={a} className="legend-item-print">
                            <div className="dot" style={{ backgroundColor: ACTION_COLORS[a] }} />
                            <span>{actionLabel(a)}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <footer className="print-page__footer">
                Documento de Estudio · RangeCraft Studio
            </footer>
          </div>
        ))}
      </div>
    </div>
  );
}
