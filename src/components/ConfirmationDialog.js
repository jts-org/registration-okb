import { TRAINEE_SESSION_REGISTRATION_FORM_LABELS } from "../constants";

function ConfirmationDialog({data, onConfirm, onCancel}) {
  console.log('data', data);
  return (
    <div className="confirmation-dialog">
      <div style={styles.overlay}>
        <div style={styles.dialog}>
          <div style={styles.content}>
            {data}
          </div>
          <div style={styles.buttonGroup}>
            <button style={styles.cancelButton} onClick={onCancel}>
              {TRAINEE_SESSION_REGISTRATION_FORM_LABELS.CANCEL}
            </button>
            <button style={styles.confirmButton} onClick={onConfirm}>
              {TRAINEE_SESSION_REGISTRATION_FORM_LABELS.OK}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    maxWidth: '480px',
    width: '100%',
    textAlign: 'left',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 170, 0.1)',
    animation: 'dialogSlideIn 0.3s ease',
  },
  content: {
    marginBottom: '24px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
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

// Add keyframe animation via style tag (alternatively add to CSS)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes dialogSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .confirmation-dialog button:hover {
    transform: translateY(-2px);
  }
  
  .confirmation-dialog h3 {
    color: #ffffff;
    font-size: 1.25rem;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #2a2a3e;
  }
  
  .confirmation-dialog label {
    color: #6b6b7b;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-top: 12px;
    margin-bottom: 4px;
  }
  
  .confirmation-dialog b {
    color: #00d4aa;
    font-weight: 600;
    font-size: 1rem;
  }
`;
if (!document.querySelector('[data-confirmation-dialog-styles]')) {
  styleSheet.setAttribute('data-confirmation-dialog-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default ConfirmationDialog;