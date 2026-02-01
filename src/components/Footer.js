import oqmLogo from '../oqm_logo.png';
import reactLogo from '../logo.svg';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <img src={oqmLogo} alt="Overclocked Quantum Moose" style={styles.logo} />
          <span style={styles.companyName}>Overclocked Quantum Moose</span>
        </div>
        <div style={styles.copyright}>
          © {currentYear} Overclocked Quantum Moose. All rights reserved.
        </div>
        <div style={styles.poweredBy}>
          <span style={styles.poweredByText}>Powered by</span>
          <img src={reactLogo} alt="React" style={styles.reactLogo} />
          <span style={styles.reactText}>React</span>
        </div>
        <div style={styles.trademark}>
          React is a trademark of Meta Platforms, Inc.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    borderTop: '1px solid #2a2a3e',
    padding: '24px 16px',
    marginTop: 'auto',
    width: '100%',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    height: '28px',
    width: 'auto',
    opacity: 0.8,
    transition: 'opacity 0.25s ease',
  },
  companyName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#a0a0b0',
    letterSpacing: '0.02em',
  },
  copyright: {
    fontSize: '0.75rem',
    color: '#6b6b7b',
    textAlign: 'center',
  },
  poweredBy: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  poweredByText: {
    fontSize: '0.7rem',
    color: '#6b6b7b',
  },
  reactLogo: {
    height: '18px',
    width: 'auto',
    animation: 'spin 10s linear infinite',
  },
  reactText: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#61dafb',
  },
  trademark: {
    fontSize: '0.65rem',
    color: '#4a4a5a',
    marginTop: '4px',
    fontStyle: 'italic',
  },
};

// Inject spin animation for React logo
if (typeof document !== 'undefined' && !document.querySelector('[data-footer-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-footer-styles', 'true');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Footer;
