import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function PromptModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  label, 
  defaultValue = '' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (val: string) => void, 
  title: string, 
  label: string,
  defaultValue?: string
}) {
  const [val, setVal] = useState(defaultValue);
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: '1rem 0' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{label}</p>
        <input 
          autoFocus
          className="quick-select" 
          style={{ width: '100%', padding: '0.8rem' }}
          value={val} 
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { onConfirm(val); onClose(); }
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => { onConfirm(val); onClose(); }}>Confirmar</button>
      </div>
    </Modal>
  );
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string 
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => { onConfirm(); onClose(); }}>Confirmar</button>
      </div>
    </Modal>
  );
}
