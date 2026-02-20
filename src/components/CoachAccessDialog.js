/**
 * Coach Access Dialog Component
 * Shows PIN login first, with option to continue anonymously with password
 */

import { useState } from 'react';

const LABELS = {
  TITLE_PIN: 'Vetäjän kirjautuminen',
  TITLE_PASSWORD: 'Anna salasana',
  PIN: 'PIN-koodi',
  PIN_PLACEHOLDER: 'Syötä PIN (4-6 numeroa)',
  LOGIN: 'Kirjaudu',
  CANCEL: 'Peruuta',
  PASSWORD: 'Salasana',
  PASSWORD_PLACEHOLDER: 'Syötä salasana...',
  CONTINUE_ANONYMOUS: 'Jatka salasanalla',
  BACK_TO_PIN: 'Anna PIN-koodi',
  
  ERROR_WRONG_PIN: 'Virheellinen PIN-koodi',
  ERROR_WRONG_PASSWORD: 'Väärä salasana',
  ERROR_PIN_FORMAT: 'PIN täytyy olla 4-6 numeroa',
};

const MODE = {
  PIN: 'pin',
  PASSWORD: 'password',
};

function CoachAccessDialog({ 
  onPinLogin,      // (pin) => Promise<{success, coach?}>
  onPasswordLogin, // (password) => boolean
  onCancel,
  isLoading = false,
  error: externalError,
}) {
  const [mode, setMode] = useState(MODE.PIN);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const error = externalError || localError;

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    setLocalError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setLocalError('');
  };

  const validatePin = (pinValue) => {
    return /^\d{4,6}$/.test(pinValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (mode === MODE.PIN) {
      if (!validatePin(pin)) {
        setLocalError('pin_format');
        return;
      }
      onPinLogin(pin);
    } else {
      if (!password.trim()) {
        setLocalError('wrong_password');
        return;
      }
      onPasswordLogin(password);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const switchToPassword = () => {
    setMode(MODE.PASSWORD);
    setLocalError('');
    setPin('');
  };

  const switchToPin = () => {
    setMode(MODE.PIN);
    setLocalError('');
    setPassword('');
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'wrong_pin': return LABELS.ERROR_WRONG_PIN;
      case 'wrong_password': return LABELS.ERROR_WRONG_PASSWORD;
      case 'pin_format': return LABELS.ERROR_PIN_FORMAT;
      default: return errorCode;
    }
  };

  const isPinMode = mode === MODE.PIN;
  const title = isPinMode ? LABELS.TITLE_PIN : LABELS.TITLE_PASSWORD;

  return (
    <div style={styles.overlay} onKeyDown={handleKeyDown}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>{title}</h3>
        
        <form onSubmit={handleSubmit}>
          {isPinMode ? (
            <>
              <label style={styles.label}>{LABELS.PIN}</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={handlePinChange}
                placeholder={LABELS.PIN_PLACEHOLDER}
                style={styles.input}
                disabled={isLoading}
                maxLength={6}
                autoFocus
              />
            </>
          ) : (
            <>
              <label style={styles.label}>{LABELS.PASSWORD}</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder={LABELS.PASSWORD_PLACEHOLDER}
                style={styles.input}
                disabled={isLoading}
                autoFocus
              />
            </>
          )}
          
          {error && (
            <div style={styles.error}>{getErrorMessage(error)}</div>
          )}
          
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              style={styles.cancelButton} 
              onClick={onCancel}
              disabled={isLoading}
            >
              {LABELS.CANCEL}
            </button>
            <button 
              type="submit" 
              style={styles.confirmButton}
              disabled={isLoading}
            >
              {isLoading ? '...' : LABELS.LOGIN}
            </button>
          </div>
        </form>
        
        {/* Switch mode link */}
        <div style={styles.switchSection}>
          {isPinMode ? (
            <button 
              type="button" 
              style={styles.linkButton} 
              onClick={switchToPassword}
              disabled={isLoading}
            >
              {LABELS.CONTINUE_ANONYMOUS}
            </button>
          ) : (
            <button 
              type="button" 
              style={styles.linkButton} 
              onClick={switchToPin}
              disabled={isLoading}
            >
              {LABELS.BACK_TO_PIN}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

CoachAccessDialog.LABELS = LABELS;
CoachAccessDialog.MODE = MODE;

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
    boxSizing: 'border-box',
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
  switchSection: {
    marginTop: '16px',
    textAlign: 'center',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#00d4aa',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '8px',
  },
};

export default CoachAccessDialog;
