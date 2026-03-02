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
import { registerTraineePin, verifyTraineePin } from '../../services/Api';
import Snackbar from '../common/Snackbar';
import useTraineeRegistrations from '../../hooks/trainee/useTraineeRegistrations';
import { AGE_GROUP_OPTIONS, NOTIFICATION_MESSAGES } from '../../constants';
import { stringToDate } from '../../utils/formUtils';

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

const AGE_RESET = { value: '', isMinor: false, isAgeValid: false };

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

const ageInputStyles = {
  container: {
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.95rem',
  },
  inputWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0',
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  spinButton: {
    width: '48px',
    height: '56px',
    background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
    color: 'white',
    border: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
  },
  input: {
    width: '80px',
    height: '56px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    border: 'none',
    background: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    MozAppearance: 'textfield',
    WebkitAppearance: 'none',
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
  const [age, setAge] = useState(AGE_RESET);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPinVerifying, setIsPinVerifying] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isPINConfirmed, setIsPINConfirmed] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUP_OPTIONS[0]);

  const { onNewTraineeRegistration } = useTraineeRegistrations();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectedAgeGroupChange = (ageGroup) => {
    setSelectedAgeGroup(ageGroup);
    if (ageGroup === AGE_GROUP_OPTIONS[0]) {
      setAge(AGE_RESET);
    } else {
      setAge(prev => ({ ...prev, isMinor: true }));
    }
  };

  const handleAgeChange = useCallback((newAge) => {
    // Check if form is valid - age required for under-18
    let currentAge = newAge;
    const isMinor = selectedAgeGroup === AGE_GROUP_OPTIONS[1];
    const isAgeValid = !isMinor || (newAge && parseInt(newAge, 10) >= 1 && parseInt(newAge, 10) <= 17);    
    if (!isAgeValid) {
      currentAge = '';
      setSelectedAgeGroup(AGE_GROUP_OPTIONS[0]);
      setSnackbar({ open: true, message: 'Ikäryhmä muuttunut: 18+ -ikäryhmäksi', severity: 'success' });
    }
    setAge({value: currentAge, isMinor, isAgeValid});
  }, [selectedAgeGroup]);

  // Set age and age group from trainee object
  const setTraineeAgeAndGroup = useCallback((trainee) => {
    const ageNum = parseInt(trainee.age, 10);
    if (!isNaN(ageNum)) {
      if (ageNum < 18) {
        setSelectedAgeGroup(AGE_GROUP_OPTIONS[1]);
        setAge({ value: trainee.age, isMinor: true, isAgeValid: ageNum >= 1 && ageNum <= 17 });
      } else {
        setSelectedAgeGroup(AGE_GROUP_OPTIONS[0]);
        setAge({ value: trainee.age, isMinor: false, isAgeValid: true });
      }
    } else {
      setAge(AGE_RESET);
    }
  }, []);

  // Handle register click - show dialog for name input
  const handleRegisterClick = useCallback((session) => {
    setSelectedSession(session);
    setShowConfirmationDialog(true);
    setFirstName('');
    setLastName('');
    setPin('');
    setAge(AGE_RESET);
    setPinError('');
    setIsPINConfirmed(false);
  }, []);

  // Handle registration confirmation
  // PIN validation and registration logic
  const handleConfirmed = useCallback(async () => {
    if (!selectedSession) return;
    if (!pin.trim()) {
      setSnackbar({ open: true, message: 'PIN vaaditaan. Syötä PIN tai rekisteröi uusi.', severity: 'error' });
      return;
    }
    setIsPinVerifying(true);
    try {
      const result = await verifyTraineePin(pin);
      if (result?.result === 'success' && result.data?.trainee) {
        setFirstName(result.data.trainee.firstName || '');
        setLastName(result.data.trainee.lastName || '');
        setTraineeAgeAndGroup(result.data.trainee);
        setShowConfirmationDialog(true);
        setSnackbar({ open: true, message: 'PIN hyväksytty!', severity: 'success' });
        setIsPINConfirmed(true);
      } else {
        setIsPINConfirmed(false);
        if (result?.data?.message) {
          if (result.data.message === 'no_match') {
            setSnackbar({ open: true, message: 'PIN ei löydy. Varmista, että syötetty PIN on oikea tai rekisteröi uusi PIN.', severity: 'error' });
          } else if (result.data.message === 'no_pin_provided') {
            setSnackbar({ open: true, message: 'PIN vaaditaan. Syötä PIN tai rekisteröi uusi.', severity: 'error' });
          }
          return;
        }
        setSnackbar({ open: true, message: result?.message || 'PIN ei kelpaa', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Virhe PIN-tarkistuksessa', severity: 'error' });
    } finally {
      setIsPinVerifying(false);
    }
  }, [selectedSession, pin, setTraineeAgeAndGroup]);

  const getValidAge = useCallback(() => {
    if (age === null || isNaN(age.value)) {
      return null;
    }
    return parseInt(age.value, 10);
  }, [age]);

  const handleRegisterToSession = useCallback(async () => {
    if (!selectedSession) return;
    setIsRegistering(true);
    try {
      const registrationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ageGroup: selectedAgeGroup,
        age: getValidAge(),
        sessionName: selectedSession.sessionType,
        dates: stringToDate(selectedSession.date),
      };
      const result = await onNewTraineeRegistration(registrationData);
      if (result.success) {
        if (result.exists) {
          setSnackbar({ open: true, message: NOTIFICATION_MESSAGES.REGISTRATION_EXISTS, severity: 'info' });
        } else {
          setSnackbar({ open: true, message: NOTIFICATION_MESSAGES.REGISTRATION_SUCCESS, severity: 'success' });
        }
        selectedSession.registeredCount = (selectedSession.registeredCount || 0) + 1;
        setShowConfirmationDialog(false);
        setSelectedSession(null);
        setFirstName('');
        setLastName('');
        setAge(AGE_RESET);
        setPin('');
        setPinError('');
        setIsPINConfirmed(false);
      } else {
        setSnackbar({ open: true, message: result.error?.message || NOTIFICATION_MESSAGES.REGISTRATION_FAILED, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: NOTIFICATION_MESSAGES.REGISTRATION_FAILED, severity: 'error' });
    } finally {
      setIsRegistering(false);
    }
  }, [firstName, lastName, selectedAgeGroup, getValidAge, selectedSession, onNewTraineeRegistration]);

  // Handle registration cancellation
  const handleCancelled = useCallback(() => {
    setShowConfirmationDialog(false);
    setSelectedSession(null);
    setFirstName('');
    setLastName('');
    setPin('');
    setAge(AGE_RESET);
    setPinError('');
    setIsPINConfirmed(false);
    setSelectedAgeGroup(AGE_GROUP_OPTIONS[0]);
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
              const canRegister = !isRegistering;
              const isRegisteredIntoSession = session.registeredCount > 0;
              return (
                <div
                  key={`${session.scheduleId}-${idx}`}
                  style={{
                    ...styles.sessionCard,
                    backgroundColor: '#ccffcc',
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
                  </div>
                  <ToggleButtons
                    onClick={() => handleRegisterClick(session)}
                    buttonsGroup={[isRegistering ? '...' : LABELS.REGISTER]}
                    single={true}
                    buttonRef={null}
                    disabled={!canRegister || isRegisteredIntoSession }
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="password"
                  id="quick-pin"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Syötä PIN (4-6 numeroa)"
                  autoFocus
                  style={{ flex: 1 }}
                />
                {isPinVerifying
                  ? <CircularProgress size={24} style={{ marginLeft: 8 }} />
                  : <ToggleButtons
                      onClick={handleConfirmed}
                      buttonsGroup={["Vahvista"]}
                      single={true}
                      buttonRef={null}
                      disabled={pin.length < 4}
                      sx={{ minWidth: '90px', padding: '6px 14px', fontSize: '0.9rem' }}
                    />
                }
              </div>
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
                placeholder='Teppo'
                disabled
              />
              <br />
              <label htmlFor="quick-lname">Sukunimi:</label>
              <input
                type="text"
                id="quick-lname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder='Testinen'
                disabled
              />
              {/* Age field will be shown if under 18 after PIN validation */}
              <br />
              <ToggleButtons
                onClick={handleSelectedAgeGroupChange}
                buttonsGroup={AGE_GROUP_OPTIONS}
                buttonRef={null}
                selected={selectedAgeGroup}
              />
              {age.isMinor && (
                <div style={ageInputStyles.container}>
                  <label htmlFor="age" style={ageInputStyles.label}>{'Ikä:'}</label>
                  <div style={ageInputStyles.inputWrapper}>
                    <button 
                      type="button"
                      style={ageInputStyles.spinButton}
                      onClick={() => handleAgeChange(Math.max(1, (parseInt(age.value) || 1) - 1).toString())}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="18"
                      value={age.value}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      placeholder="—"
                      style={ageInputStyles.input}
                    />
                    <button 
                      type="button"
                      style={ageInputStyles.spinButton}
                      onClick={() => handleAgeChange(Math.min(18, (parseInt(age.value) || 0) + 1).toString())}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              <br />
            </div>
          }
          onConfirm={handleRegisterToSession}
          onCancel={handleCancelled}
          confirmDisabled={!isPINConfirmed}
          confirmLoading={isRegistering}
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
          onRegister={async (fname, lname, pinValue, age) => {
            try {
              const result = await registerTraineePin({ firstName: fname, lastName: lname, pin: pinValue, age: age });
              if (result?.result === 'success') {
                setShowPinDialog(false);
                setSnackbar({ open: true, message: 'PIN rekisteröity! Voit nyt ilmoittautua treeniin.', severity: 'success' });
                // Optionally autofill PIN and trainee info here
              } else {
                setSnackbar({ open: true, message: result?.message || 'Rekisteröinti epäonnistui', severity: 'error' });
              }
            } catch (error) {
              setSnackbar({ open: true, message: 'Virhe PIN-rekisteröinnissä', severity: 'error' });
            }
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
