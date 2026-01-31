import { useRef } from 'react';
import ToggleButtons from './common/ToggleButtons';
import { TAB_LABELS } from '../constants';

const tabs = [TAB_LABELS.MAIN];

const ADMIN_LABELS = {
  TITLE: 'Ylläpito',
  DESCRIPTION: 'Ylläpitonäkymä on työn alla...',
};

function AdminView({ onSelect }) {
  const tabButtonRef = useRef(null);

  const handleTabClick = (option) => {
    onSelect(option);
  };

  return (
    <div className="admin-view-container" style={styles.container}>
      <div className="main-menu">
        <ToggleButtons
          onClick={handleTabClick}
          buttonsGroup={tabs}
          buttonRef={tabButtonRef}
          selected={null}
          single={true}
          disabled={false}
        />
      </div>
      
      <div style={styles.content}>
        <h2 style={styles.title}>{ADMIN_LABELS.TITLE}</h2>
        <p style={styles.description}>{ADMIN_LABELS.DESCRIPTION}</p>
        
        <div style={styles.placeholder}>
          <div style={styles.icon}>🛠️</div>
          <p style={styles.placeholderText}>Tulossa pian</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
  },
  content: {
    marginTop: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
    color: '#ffffff',
    marginBottom: '16px',
  },
  description: {
    color: '#a0a0b0',
    fontSize: '1rem',
    marginBottom: '32px',
  },
  placeholder: {
    background: 'rgba(26, 26, 46, 0.8)',
    border: '2px dashed #2a2a3e',
    borderRadius: '16px',
    padding: '48px 24px',
    marginTop: '24px',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  placeholderText: {
    color: '#6b6b7b',
    fontSize: '1rem',
    fontStyle: 'italic',
    margin: 0,
  },
};

export default AdminView;
