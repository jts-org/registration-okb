/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useEffect, useCallback, useState } from 'react';
import ToggleButtons from '../common/ToggleButtons';
import CircularProgress from '@mui/material/CircularProgress';
import useUpcomingTraineeSessions from '../../hooks/trainee/useUpcomingTraineeSessions';
import ConfirmationDialog from '../common/ConfirmationDialog';
import CoachPinDialog from '../auth/CoachPinDialog';
import Snackbar from '../common/Snackbar';
import useTraineeRegistrations from '../../hooks/trainee/useTraineeRegistrations';
import { NOTIFICATION_MESSAGES } from '../../constants';

const WEEKDAY_NAMES = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

const LABELS = {
  TRAINEE_REGISTRATION_TITLE: 'Harrastajan rekisteröityminen treenisessioon',
  TITLE: 'Tulevat harjoitussessiot',
  NO_SESSIONS: 'Ei tulevia sessioita aikataulussa',
  REGISTER: 'Ilmoittaudu',
  LOADING: 'Ladataan sessioita...',
  ERROR: 'Virhe ladattaessa sessioita',
  REFRESH: 'Päivitä',
  SETUP_REQUIRED: 'Viikkoaikataulu puuttuu',
  REGISTERED_COUNT: 'Ilmoittautuneita:',
};

/**
 * Format date string to Finnish format with weekday
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} weekday - 0=Mon, 1=Tue, ..., 6=Sun
 * @returns {string} - e.g., "Ma 17.2.2026"
 */
function formatDateWithWeekday(dateStr, weekday) {
  const [year, month, day] = dateStr.split('-');
  const dayName = WEEKDAY_NAMES[weekday] || '';
  return `${dayName} ${parseInt(day, 10)}.${parseInt(month, 10)}.${year}`;
}

/**
 * Component styles
 */
const styles = {
  container: {
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  refreshButton: {
    padding: '6px 12px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  dateGroup: {
    marginBottom: '16px',
  },
  dateHeader: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#e5e7bf',
    marginBottom: '8px',
    padding: '4px 0',
    borderBottom: '2px solid #1976d2',
  },
  sessionCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    color: '#000',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: '4px',
  },
  sessionDateTime: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '4px',
  },
  sessionLocation: {
    fontSize: '0.8rem',
    color: '#888',
  },
  sessionCoaches: {
    fontSize: '0.85rem',
    color: '#555',
    marginTop: '4px',
  },
  sessionRegisteredCount: {
    fontSize: '0.85rem',
    color: '#555',
    marginTop: '4px',
  },
  registerButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    minWidth: '100px',
  },
  disabledButton: {
    padding: '8px 16px',
    backgroundColor: '#bdbdbd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: 500,
    fontSize: '0.85rem',
    minWidth: '100px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    color: '#666',
  },
  error: {
    padding: '16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '8px',
    textAlign: 'center',
  },
  noSessions: {
    padding: '24px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
};

/**
 * QuickTraineeRegistration component
 * Shows upcoming training sessions and allows quick registration
 */
function QuickTraineeRegistration() {
  const { 
    sessions, 
    isLoading, 
    error, 
    fetchSessions, 
    getSessionsByDate 
  } = useUpcomingTraineeSessions();

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinError, setPinError] = useState('');

  const { onNewTraineeRegistration } = useTraineeRegistrations();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handle register click - show dialog for name input
  const handleRegisterClick = useCallback((session) => {
    setSelectedSession(session);
    setShowConfirmationDialog(true);
    setFirstName('');
    setLastName('');
    setPin('');
    setPinError('');
  }, []);

  // Handle registration confirmation
  // Placeholder for PIN validation and registration logic
  const handleConfirmed = useCallback(async () => {
    if (!selectedSession) return;
    if (!pin.trim()) {
      setPinError('PIN vaaditaan');
      return;
    }
    // TODO: Validate PIN from backend, autofill name, show age if under 18
    // If PIN not valid, show error
    // If valid, proceed with registration as before
    // For now, just close dialog
    setShowConfirmationDialog(false);
    setSnackbar({ open: true, message: 'PIN-tarkistus ei vielä toteutettu', severity: 'info' });
  }, [selectedSession, pin]);

  // Handle registration cancellation
  const handleCancelled = useCallback(() => {
    setShowConfirmationDialog(false);
    setSelectedSession(null);
    setFirstName('');
    setLastName('');
    setPin('');
    setPinError('');
  }, []);

  // Open PIN registration dialog
  const handleOpenPinDialog = () => {
    setShowConfirmationDialog(false);
    setShowPinDialog(true);
  };

  // Close PIN registration dialog
  const handleClosePinDialog = () => {
    setShowPinDialog(false);
    setShowConfirmationDialog(true);
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Render loading state
  if (isLoading && sessions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <CircularProgress size={20} style={{ marginRight: '8px' }} />
          {LABELS.LOADING}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error.includes('sheet') ? LABELS.SETUP_REQUIRED : LABELS.ERROR}: {error}
        </div>
      </div>
    );
  }

  const sessionsByDate = getSessionsByDate();
  const dates = Object.keys(sessionsByDate).sort();

  // Render no sessions
  if (dates.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>{LABELS.TITLE}</h3>
          <ToggleButtons
            onClick={fetchSessions}
            buttonsGroup={[LABELS.REFRESH]}
            single={true}
            buttonRef={null}
            disabled={isLoading}
            sx={{ minWidth: '100px', padding: '6px 12px', fontSize: '0.85rem' }}
          />
        </div>
        <div style={styles.noSessions}>
          {LABELS.NO_SESSIONS}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>{LABELS.TRAINEE_REGISTRATION_TITLE}</h2>
      <div style={styles.header}>
        <h3 style={styles.title}>{LABELS.TITLE}</h3>
        <ToggleButtons
          onClick={fetchSessions}
          buttonsGroup={[isLoading ? '...' : LABELS.REFRESH]}
          single={true}
          buttonRef={null}
          disabled={isLoading}
          sx={{ minWidth: '100px', padding: '6px 12px', fontSize: '0.85rem' }}
        />
      </div>

      {dates.map(date => {
        const sessionsForDate = sessionsByDate[date];
        const firstSession = sessionsForDate[0];
        
        return (
          <div key={date} style={styles.dateGroup}>
            <div style={styles.dateHeader}>
              {formatDateWithWeekday(date, firstSession.weekday)}
            </div>
            
            {sessionsForDate.map((session, idx) => {
              const hasDesignatedCoach = Array.isArray(session.coaches) && session.coaches.length > 0;
              const canRegister = !isRegistering;

              return (
                <div
                  key={`${session.scheduleId}-${idx}`}
                  style={{
                    ...styles.sessionCard,
                    backgroundColor: hasDesignatedCoach ? '#ccffcc' : '#ffcccc',
                  }}
                >
                  <div style={styles.sessionInfo}>
                    <div style={styles.sessionName}>{session.sessionType}</div>
                    <div style={styles.sessionDateTime}>
                      {session.startTime} – {session.endTime}
                    </div>
                    {session.location && (
                      <div style={styles.sessionLocation}>{session.location}</div>
                    )}
                    <div style={styles.sessionCoaches}>
                      {/* Vetäjä: {hasDesignatedCoach ? session.coaches.join(', ') : '—'} */}
                    </div>
                    {session.registeredCount !== undefined && session.registeredCount > 0 && (
                      <div style={styles.sessionRegisteredCount}>
                        {LABELS.REGISTERED_COUNT} {session.registeredCount}
                      </div>
                    )}
                  </div>
                  <ToggleButtons
                    onClick={() => handleRegisterClick(session)}
                    buttonsGroup={[isRegistering ? '...' : LABELS.REGISTER]}
                    single={true}
                    buttonRef={null}
                    disabled={!canRegister}
                    sx={{ minWidth: '100px', padding: '8px 16px', fontSize: '0.85rem' }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}

      {showConfirmationDialog && selectedSession && (
        <ConfirmationDialog 
          data={
            <div>
              <h3>Ilmoittautuminen</h3>
              <p><strong>{selectedSession.sessionType}</strong></p>
              <p>{formatDateWithWeekday(selectedSession.date, selectedSession.weekday)}</p>
              <p>{selectedSession.startTime} – {selectedSession.endTime}</p>
              <br />
              <label htmlFor="quick-pin">PIN-koodi:</label>
              <input
                type="password"
                id="quick-pin"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Syötä PIN (4-6 numeroa)"
                autoFocus
              />
              {pinError && <div style={{ color: '#c62828', marginTop: 4 }}>{pinError}</div>}
              <div style={{ marginTop: 8 }}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }} onClick={handleOpenPinDialog}>
                  Rekisteröi uusi PIN
                </button>
              </div>
              {/* Name fields will be autofilled after PIN validation */}
              <br />
              <label htmlFor="quick-fname">Etunimi:</label>
              <input 
                type="text" 
                id="quick-fname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled
              />
              <br />
              <label htmlFor="quick-lname">Sukunimi:</label>
              <input 
                type="text" 
                id="quick-lname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled
              />
              {/* Age field will be shown if under 18 after PIN validation */}
            </div>
          }
          onConfirm={handleConfirmed}
          onCancel={handleCancelled}
        />
      )}

      {/* PIN registration dialog for trainee (no alias) */}
      {showPinDialog && (
        <CoachPinDialog
          open={showPinDialog}
          onClose={handleClosePinDialog}
          isLoading={false}
          initialMode={CoachPinDialog.MODE.REGISTER}
          showAlias={false}
          // onRegister: custom handler for trainee PIN registration (no alias)
          onRegister={(fname, lname, pinValue) => {
            // TODO: Implement backend call for trainee PIN registration
            setShowPinDialog(false);
            setSnackbar({ open: true, message: 'PIN-rekisteröinti ei vielä toteutettu', severity: 'info' });
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}

export default QuickTraineeRegistration;
