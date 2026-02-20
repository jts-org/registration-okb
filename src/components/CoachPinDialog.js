/**
 * Coach PIN Dialog Component
 * Handles both PIN login and PIN registration
 */

import { useState } from 'react';

const DIALOG_LABELS = {
  // Login mode
  LOGIN_TITLE: 'Anna PIN-koodi',
  FIRST_NAME: 'Etunimi',
  LAST_NAME: 'Sukunimi',
  PIN: 'PIN-koodi',
  PIN_PLACEHOLDER: 'Syötä PIN (4-6 numeroa)',
  LOGIN: 'Kirjaudu',
  CANCEL: 'Peruuta',
  
  // Register mode
  REGISTER_TITLE: 'Rekisteröi PIN-koodi',
  ALIAS: 'Alias (valinnainen)',
  ALIAS_PLACEHOLDER: 'Näyttönimi (esim. Coach Matt)',
  CONFIRM_PIN: 'Vahvista PIN',
  REGISTER: 'Rekisteröi',
  
  // Errors
  ERROR_WRONG_PIN: 'Virheellinen PIN-koodi',
  ERROR_NOT_FOUND: 'Käyttäjää ei löydy',
  ERROR_EXISTS: 'Käyttäjä on jo rekisteröity',
  ERROR_PIN_TAKEN: 'PIN-koodi on jo käytössä',
  ERROR_PIN_MISMATCH: 'PIN-koodit eivät täsmää',
  ERROR_PIN_FORMAT: 'PIN täytyy olla 4-6 numeroa',
  ERROR_NAME_REQUIRED: 'Etu- ja sukunimi vaaditaan',
  ERROR_REGISTRATION_FAILED: 'Rekisteröinti epäonnistui',
  ERROR_VERIFICATION_FAILED: 'Kirjautuminen epäonnistui',
  
  // Links
  NO_PIN: 'Ei PIN-koodia?',
  REGISTER_LINK: 'Rekisteröidy tästä',
  HAS_PIN: 'Onko sinulla jo PIN?',
  LOGIN_LINK: 'Kirjaudu tästä',
};

const MODE = {
  LOGIN: 'login',
  REGISTER: 'register',
};

function CoachPinDialog({ 
  open = false,
  onLogin, 
  onRegister, 
  onClose, 
  isLoading = false,
  error: externalError,
  initialMode = MODE.LOGIN 
}) {
  const [mode, setMode] = useState(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [alias, setAlias] = useState('');
  const [localError, setLocalError] = useState('');

  const error = externalError || localError;

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'wrong_pin': return DIALOG_LABELS.ERROR_WRONG_PIN;
      case 'not_found': return DIALOG_LABELS.ERROR_NOT_FOUND;
      case 'exists': return DIALOG_LABELS.ERROR_EXISTS;
      case 'pin_taken': return DIALOG_LABELS.ERROR_PIN_TAKEN;
      case 'pin_mismatch': return DIALOG_LABELS.ERROR_PIN_MISMATCH;
      case 'pin_format': return DIALOG_LABELS.ERROR_PIN_FORMAT;
      case 'name_required': return DIALOG_LABELS.ERROR_NAME_REQUIRED;
      case 'registration_failed': return DIALOG_LABELS.ERROR_REGISTRATION_FAILED;
      case 'verification_failed': return DIALOG_LABELS.ERROR_VERIFICATION_FAILED;
      default: return errorCode;
    }
  };

  const validatePin = (pinValue) => {
    const pinStr = pinValue.toString();
    return /^\d{4,6}$/.test(pinStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    // Validate name (only in register mode)
    if (mode === MODE.REGISTER && (!firstName.trim() || !lastName.trim())) {
      setLocalError('name_required');
      return;
    }

    // Validate PIN format
    if (!validatePin(pin)) {
      setLocalError('pin_format');
      return;
    }

    if (mode === MODE.REGISTER) {
      // Validate PIN confirmation
      if (pin !== confirmPin) {
        setLocalError('pin_mismatch');
        return;
      }
      onRegister(firstName.trim(), lastName.trim(), pin, alias.trim());
    } else {
      onLogin(pin);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === MODE.LOGIN ? MODE.REGISTER : MODE.LOGIN);
    setLocalError('');
    setPin('');
    setConfirmPin('');
  };

  const handlePinChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  const handleConfirmPinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setConfirmPin(value);
  };

  const isLoginMode = mode === MODE.LOGIN;
  const title = isLoginMode ? DIALOG_LABELS.LOGIN_TITLE : DIALOG_LABELS.REGISTER_TITLE;

  // Don't render if not open
  if (!open) return null;

  return (
    <div style={styles.overlay} onKeyDown={handleKeyDown}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>{title}</h3>
        
        <form onSubmit={handleSubmit}>
          {/* First Name (only in register mode) */}
          {!isLoginMode && (
            <>
              <label style={styles.label}>{DIALOG_LABELS.FIRST_NAME}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={styles.input}
                disabled={isLoading}
                autoFocus
              />
            </>
          )}
          
          {/* Last Name (only in register mode) */}
          {!isLoginMode && (
            <>
              <label style={styles.label}>{DIALOG_LABELS.LAST_NAME}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={styles.input}
                disabled={isLoading}
              />
            </>
          )}
          
          {/* Alias (only in register mode) */}
          {!isLoginMode && (
            <>
              <label style={styles.label}>{DIALOG_LABELS.ALIAS}</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder={DIALOG_LABELS.ALIAS_PLACEHOLDER}
                style={styles.input}
                disabled={isLoading}
              />
            </>
          )}
          
          {/* PIN */}
          <label style={styles.label}>{DIALOG_LABELS.PIN}</label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={handlePinChange}
            placeholder={DIALOG_LABELS.PIN_PLACEHOLDER}
            style={styles.input}
            disabled={isLoading}
            maxLength={6}
            autoFocus={isLoginMode}
          />
          
          {/* Confirm PIN (only in register mode) */}
          {!isLoginMode && (
            <>
              <label style={styles.label}>{DIALOG_LABELS.CONFIRM_PIN}</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={handleConfirmPinChange}
                placeholder={DIALOG_LABELS.PIN_PLACEHOLDER}
                style={styles.input}
                disabled={isLoading}
                maxLength={6}
              />
            </>
          )}
          
          {/* Error message */}
          {error && (
            <div style={styles.error}>{getErrorMessage(error)}</div>
          )}
          
          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              style={styles.cancelButton} 
              onClick={onClose}
              disabled={isLoading}
            >
              {DIALOG_LABELS.CANCEL}
            </button>
            <button 
              type="submit" 
              style={styles.confirmButton}
              disabled={isLoading}
            >
              {isLoading ? '...' : (isLoginMode ? DIALOG_LABELS.LOGIN : DIALOG_LABELS.REGISTER)}
            </button>
          </div>
          
          {/* Mode switch link */}
          <div style={styles.switchMode}>
            <span style={styles.switchText}>
              {isLoginMode ? DIALOG_LABELS.NO_PIN : DIALOG_LABELS.HAS_PIN}{' '}
            </span>
            <button 
              type="button" 
              style={styles.linkButton} 
              onClick={switchMode}
              disabled={isLoading}
            >
              {isLoginMode ? DIALOG_LABELS.REGISTER_LINK : DIALOG_LABELS.LOGIN_LINK}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Expose labels and modes for external use
CoachPinDialog.LABELS = DIALOG_LABELS;
CoachPinDialog.MODE = MODE;

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
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(102, 126, 234, 0.1)',
    animation: 'dialogSlideIn 0.3s ease',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    marginTop: '16px',
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
    boxSizing: 'border-box',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.875rem',
    marginTop: '16px',
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 107, 107, 0.3)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: 'transparent',
    color: '#a0a0b0',
    border: '2px solid #2a2a3e',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  confirmButton: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  switchMode: {
    marginTop: '20px',
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #2a2a3e',
  },
  switchText: {
    color: '#6b6b7b',
    fontSize: '0.875rem',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
};

export default CoachPinDialog;
