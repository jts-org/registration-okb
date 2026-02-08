import { useEffect } from 'react';

/**
 * Snackbar notification component
 * @param {Object} props
 * @param {boolean} props.open - Whether the snackbar is visible
 * @param {string} props.message - The message to display
 * @param {'success' | 'error'} props.severity - The type of notification
 * @param {function} props.onClose - Callback when snackbar closes
 * @param {number} props.autoHideDuration - Duration in ms before auto-close (default 4000)
 */
function Snackbar({ open, message, severity = 'success', onClose, autoHideDuration = 4000 }) {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const isSuccess = severity === 'success';

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.snackbar,
        background: isSuccess ? styles.successBg : styles.errorBg,
        boxShadow: isSuccess ? styles.successShadow : styles.errorShadow,
      }}>
        <span style={styles.icon}>
          {isSuccess ? '✓' : '✕'}
        </span>
        <span style={styles.message}>{message}</span>
        <button 
          onClick={onClose} 
          style={styles.closeButton}
          aria-label="Sulje"
        >
          ×
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 4000,
    animation: 'snackbarSlideUp 0.3s ease',
  },
  snackbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    borderRadius: '12px',
    minWidth: '280px',
    maxWidth: '90vw',
  },
  successBg: 'linear-gradient(135deg, #00d4aa 0%, #00a885 100%)',
  errorBg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
  successShadow: '0 8px 32px rgba(0, 212, 170, 0.4)',
  errorShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
  icon: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes snackbarSlideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
if (!document.head.querySelector('style[data-snackbar-animation]')) {
  styleSheet.setAttribute('data-snackbar-animation', 'true');
  document.head.appendChild(styleSheet);
}

export default Snackbar;
