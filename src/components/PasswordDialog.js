/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState } from 'react';

const PASSWORD_DIALOG_LABELS = {
  TITLE_COACH: 'Vetäjän kirjautuminen',
  TITLE_ADMIN: 'Ylläpitäjän kirjautuminen',
  PASSWORD_LABEL: 'Salasana:',
  PASSWORD_PLACEHOLDER: 'Syötä salasana...',
  OK: 'OK',
  CANCEL: 'Peruuta',
  ERROR_WRONG_PASSWORD: 'Väärä salasana',
};

function PasswordDialog({ onConfirm, onCancel, error: externalError, isAdmin = false }) {
  const [password, setPassword] = useState('');
  
  const title = isAdmin ? PASSWORD_DIALOG_LABELS.TITLE_ADMIN : PASSWORD_DIALOG_LABELS.TITLE_COACH;

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm(password);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>{title}</h3>
        
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>
            {PASSWORD_DIALOG_LABELS.PASSWORD_LABEL}
          </label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            placeholder={PASSWORD_DIALOG_LABELS.PASSWORD_PLACEHOLDER}
            style={styles.input}
            autoFocus
            disabled={!!externalError}
          />
          
          {externalError && <div style={styles.error}>{externalError}</div>}
          
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              style={styles.cancelButton} 
              onClick={onCancel}
              disabled={!!externalError}
            >
              {PASSWORD_DIALOG_LABELS.CANCEL}
            </button>
            <button 
              type="submit" 
              style={styles.confirmButton}
              disabled={!!externalError}
            >
              {PASSWORD_DIALOG_LABELS.OK}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Expose labels for external use (e.g., showing wrong password error)
PasswordDialog.LABELS = PASSWORD_DIALOG_LABELS;

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    padding: '16px',
  },
  dialog: {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121a 100%)',
    border: '1px solid #2a2a3e',
    padding: '32px',
    borderRadius: '20px',
    minWidth: '320px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 170, 0.1)',
    animation: 'dialogSlideIn 0.3s ease',
  },
  title: {
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '24px',
    textAlign: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #2a2a3e',
  },
  label: {
    display: 'block',
    color: '#a0a0b0',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '1rem',
    background: '#12121a',
    border: '2px solid #2a2a3e',
    borderRadius: '12px',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.25s ease',
    marginBottom: '8px',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.875rem',
    marginTop: '8px',
    marginBottom: '8px',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #2a2a3e',
  },
  confirmButton: {
    padding: '12px 28px',
    fontSize: '0.9rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 16px rgba(0, 212, 170, 0.3)',
  },
  cancelButton: {
    padding: '12px 28px',
    fontSize: '0.9rem',
    fontWeight: 600,
    background: 'transparent',
    color: '#a0a0b0',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
};

// Inject focus styles
if (typeof document !== 'undefined' && !document.querySelector('[data-password-dialog-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-password-dialog-styles', 'true');
  styleSheet.textContent = `
    .password-dialog input:focus {
      border-color: #00d4aa !important;
      box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default PasswordDialog;
