/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useRef, useState, useContext } from 'react';
import ToggleButtons from '../common/ToggleButtons';
import CampManagement from './CampManagement';
import SessionManagement from './SessionManagement';
import PerformanceReport from './PerformanceReport';
import { TAB_LABELS } from '../../constants';
import { LoadingContext } from '../../contexts/LoadingContext';

const tabs = [TAB_LABELS.MAIN];

const ADMIN_LABELS = {
  TITLE: 'Ylläpito',
  CAMPS: 'Leirit',
  SESSIONS: 'Kurssit',
  REPORTS: 'Raportit',
};

// Admin sections - easy to extend
const ADMIN_SECTIONS = {
  CAMPS: 'camps',
  SESSIONS: 'sessions',
  REPORTS: 'reports',
};

function AdminView({ onSelect }) {
  const tabButtonRef = useRef(null);
  const [activeSection, setActiveSection] = useState(ADMIN_SECTIONS.CAMPS);
  const { setLoading } = useContext(LoadingContext);

  const handleTabClick = (option) => {
    onSelect(option);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
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
        
        {/* Section Tabs */}
        <div style={styles.sectionTabs}>
          <button
            style={{
              ...styles.sectionTab,
              ...(activeSection === ADMIN_SECTIONS.CAMPS ? styles.sectionTabActive : {}),
            }}
            onClick={() => handleSectionChange(ADMIN_SECTIONS.CAMPS)}
          >
            🏕️ {ADMIN_LABELS.CAMPS}
          </button>
          <button
            style={{
              ...styles.sectionTab,
              ...(activeSection === ADMIN_SECTIONS.SESSIONS ? styles.sectionTabActive : {}),
            }}
            onClick={() => handleSectionChange(ADMIN_SECTIONS.SESSIONS)}
          >
            📅 {ADMIN_LABELS.SESSIONS}
          </button>
          <button
            style={{
              ...styles.sectionTab,
              ...(activeSection === ADMIN_SECTIONS.REPORTS ? styles.sectionTabActive : {}),
            }}
            onClick={() => handleSectionChange(ADMIN_SECTIONS.REPORTS)}
          >
            📊 {ADMIN_LABELS.REPORTS}
          </button>
        </div>

        {/* Section Content */}
        <div style={styles.sectionContent}>
          {activeSection === ADMIN_SECTIONS.CAMPS && (
            <CampManagement onLoading={handleLoading} />
          )}
          
          {activeSection === ADMIN_SECTIONS.SESSIONS && (
            <SessionManagement onLoading={handleLoading} />
          )}
          
          {activeSection === ADMIN_SECTIONS.REPORTS && (
            <PerformanceReport onLoading={handleLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '24px',
  },
  content: {
    marginTop: '24px',
  },
  title: {
    fontSize: '1.5rem',
    color: '#ffffff',
    marginBottom: '24px',
    textAlign: 'center',
  },
  sectionTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '1px solid #2a2a3e',
    paddingBottom: '12px',
  },
  sectionTab: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '0.9rem',
    fontWeight: 500,
    background: 'transparent',
    color: '#6b6b7b',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#2a2a3e',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  sectionTabActive: {
    background: 'rgba(102, 126, 234, 0.15)',
    color: '#667eea',
    borderColor: '#667eea',
  },
  sectionContent: {
    minHeight: '300px',
  },
  placeholder: {
    background: 'rgba(26, 26, 46, 0.5)',
    border: '2px dashed #2a2a3e',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
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
