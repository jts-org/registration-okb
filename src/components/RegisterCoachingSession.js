/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DatePicker from './common/DatePicker';
import ConfirmationDialog from './ConfirmationDialog';
import Snackbar from './common/Snackbar';
import CoachPinDialog from './auth/CoachPinDialog';
import QuickCoachRegistration from './QuickCoachRegistration';
import useRegisterCoachingSessionForm from '../hooks/useRegisterCoachingSessionForm';
import useCoachLogin from '../hooks/auth/useCoachLogin';
import { TAB_LABELS, COACHING_SESSION_OPTIONS, COACH_SESSION_REGISTRATION_FORM_LABELS, NOTIFICATION_MESSAGES } from '../constants';
import useCoachRegistrations from '../hooks/useCoachRegistrations';
import ToggleButtons from './common/ToggleButtons';

const tabs = [TAB_LABELS.MAIN];

const COACH_LOGIN_LABELS = {
  LOGIN: 'Anna PIN-koodi',
  LOGOUT: 'Kirjaudu ulos',
  LOGGED_IN_AS: 'Kirjautunut:',
  NOT_LOGGED_IN: 'Et ole kirjautunut',
};

const REGISTRATION_MODE = {
  QUICK: 'quick',
  MANUAL: 'manual',
};

const MODE_LABELS = {
  QUICK: 'Pikarekisteröinti',
  MANUAL: 'Manuaalinen',
};

function RegisterCoachingSession({ onSelect, coachingSessionOptions = COACHING_SESSION_OPTIONS, viewAsCoach = false }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [registrationMode, setRegistrationMode] = useState(REGISTRATION_MODE.QUICK);
  const [quickRegisteringSession, setQuickRegisteringSession] = useState(null);
  const [preselectedSession, setPreselectedSession] = useState(null);

  const tabButtonRef = useRef(null);
  
  // Coach login hook
  const { 
    coach, 
    isAuthenticated, 
    isLoading: loginLoading, 
    error: loginError,
    login, 
    register, 
    logout,
    clearError,
    getDisplayName,
  } = useCoachLogin();

  // Pre-fill name fields when coach is authenticated
  useEffect(() => {
    if (isAuthenticated && coach) {
      setFirstName(coach.firstName || '');
      setLastName(coach.lastName || '');
    }
  }, [isAuthenticated, coach]);

  const handleFirstNameChange = e => setFirstName(e.target.value);
  const handleLastNameChange = e => setLastName(e.target.value);

  const handleTabClick = (option) => {
    onSelect(option);
  };

  const { onNewCoachRegistration, isLoading: registrationsLoading } = useCoachRegistrations();

  const onCreate = async (sessionRegistrationData) => {
    const result = await onNewCoachRegistration(sessionRegistrationData);
    if (result?.success) {
      setSnackbar({
        open: true,
        message: result.exists ? NOTIFICATION_MESSAGES.REGISTRATION_EXISTS : NOTIFICATION_MESSAGES.REGISTRATION_SUCCESS,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: NOTIFICATION_MESSAGES.REGISTRATION_ERROR,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // PIN Dialog handlers
  const handleOpenPinDialog = () => {
    clearError();
    setShowPinDialog(true);
  };

  const handleClosePinDialog = () => {
    clearError();
    setShowPinDialog(false);
  };

  const handlePinLogin = async (pin) => {
    const result = await login(pin);
    if (result.success) {
      setShowPinDialog(false);
      setSnackbar({
        open: true,
        message: 'Kirjautuminen onnistui!',
        severity: 'success',
      });
    }
    // Error is handled by the hook and displayed in dialog
  };

  const handlePinRegister = async (fName, lName, pin, alias) => {
    const result = await register(fName, lName, pin, alias);
    if (result.success) {
      setShowPinDialog(false);
      setSnackbar({
        open: true,
        message: 'PIN-koodi rekisteröity!',
        severity: 'success',
      });
    }
    // Error is handled by the hook and displayed in dialog
  };

  const handleLogout = () => {
    logout();
    setFirstName('');
    setLastName('');
    setSnackbar({
      open: true,
      message: 'Kirjauduttu ulos',
      severity: 'success',
    });
  };

  // Quick registration handler
  const handleQuickRegister = useCallback(async ({ sessionType, date, firstName: fName, lastName: lName }) => {
    setQuickRegisteringSession(`${sessionType}-${date}`);
    try {
      const registrationData = {
        firstName: fName,
        lastName: lName,
        sessionName: sessionType,
        dates: new Date(date),
      };
      const result = await onNewCoachRegistration(registrationData);
      if (result?.success) {
        setSnackbar({
          open: true,
          message: result.exists ? NOTIFICATION_MESSAGES.REGISTRATION_EXISTS : NOTIFICATION_MESSAGES.REGISTRATION_SUCCESS,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: NOTIFICATION_MESSAGES.REGISTRATION_ERROR,
          severity: 'error',
        });
      }
    } finally {
      setQuickRegisteringSession(null);
    }
  }, [onNewCoachRegistration]);

  // Handler for password-authenticated users clicking register on a session
  // Switches to manual mode with preselected session and date
  const handleManualRegister = useCallback(({ sessionType, date }) => {
    setPreselectedSession({ sessionType, date });
    setRegistrationMode(REGISTRATION_MODE.MANUAL);
  }, []);

  const {
    sessionButtonRef,
    formInitialized,
    selectedSession,
    selectedDate,
    showConfirmationDialog,
    sessionRegistrationData,
    handleSessionButtonClicked,
    handleDateSelected,
    handleSubmitRegistration,
    handleConfirmed,
    handleCancelled,
  } = useRegisterCoachingSessionForm(coachingSessionOptions, onCreate);

  // Apply preselected session and date when switching to manual mode from quick registration
  useEffect(() => {
    if (preselectedSession && registrationMode === REGISTRATION_MODE.MANUAL) {
      // Find matching session option (case-insensitive match)
      const matchingSession = coachingSessionOptions.find(
        opt => opt.toUpperCase() === preselectedSession.sessionType.toUpperCase()
      );
      if (matchingSession) {
        handleSessionButtonClicked(matchingSession);
      }
      if (preselectedSession.date) {
        handleDateSelected(preselectedSession.date);
      }
      // Clear preselected data after applying
      setPreselectedSession(null);
    }
  }, [preselectedSession, registrationMode, coachingSessionOptions, handleSessionButtonClicked, handleDateSelected]);

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    !!selectedSession;

  if (!formInitialized) {
    return (
      <div style={{ position: 'relative' }}>
        <div>{COACH_SESSION_REGISTRATION_FORM_LABELS.PROCESSING}</div>
        {registrationsLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 2000,
          }}>
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="coaching-session-container">
      <div className="main-menu">
        <ToggleButtons
          onClick={handleTabClick}
          buttonsGroup={tabs}
          buttonRef={tabButtonRef}
          selected={null}
          single={true}
          //sx={{}}
          disabled={false}
        />
        <br />
      </div>      
      {/* Coach PIN Login Status */}
      <div className="coach-login-section" style={{ 
        marginBottom: '20px', 
        padding: '12px', 
        backgroundColor: isAuthenticated ? '#e8f5e9' : '#f5f5f5',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontWeight: 500, color: '#333' }}>
              {COACH_LOGIN_LABELS.LOGGED_IN_AS} <strong>{getDisplayName()}</strong>
            </span>
            <button 
              type="button"
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {COACH_LOGIN_LABELS.LOGOUT}
            </button>
          </>
        ) : (
          <>
            <span style={{ color: '#c62828' }}>{COACH_LOGIN_LABELS.NOT_LOGGED_IN}</span>
            <button 
              type="button"
              onClick={handleOpenPinDialog}
              style={{
                padding: '6px 12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {COACH_LOGIN_LABELS.LOGIN}
            </button>
          </>
        )}
      </div>

      {/* Registration Mode Toggle */}
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={() => setRegistrationMode(REGISTRATION_MODE.QUICK)}
          style={{
            padding: '8px 16px',
            backgroundColor: registrationMode === REGISTRATION_MODE.QUICK ? '#1976d2' : '#e0e0e0',
            color: registrationMode === REGISTRATION_MODE.QUICK ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: registrationMode === REGISTRATION_MODE.QUICK ? 600 : 400,
          }}
        >
          {MODE_LABELS.QUICK}
        </button>
        <button
          type="button"
          onClick={() => setRegistrationMode(REGISTRATION_MODE.MANUAL)}
          style={{
            padding: '8px 16px',
            backgroundColor: registrationMode === REGISTRATION_MODE.MANUAL ? '#1976d2' : '#e0e0e0',
            color: registrationMode === REGISTRATION_MODE.MANUAL ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: registrationMode === REGISTRATION_MODE.MANUAL ? 600 : 400,
          }}
        >
          {MODE_LABELS.MANUAL}
        </button>
      </div>

      {/* Quick Registration Mode */}
      {registrationMode === REGISTRATION_MODE.QUICK && (
        <QuickCoachRegistration
          isAuthenticated={isAuthenticated}
          isPasswordAuthenticated={viewAsCoach && !isAuthenticated}
          coach={coach}
          onRegister={handleQuickRegister}
          onManualRegister={handleManualRegister}
          isRegistering={!!quickRegisteringSession}
          coachDisplayName={getDisplayName()}
        />
      )}

      {/* Manual Registration Mode */}
      {registrationMode === REGISTRATION_MODE.MANUAL && (
        <>
      <h2>{COACH_SESSION_REGISTRATION_FORM_LABELS.COACH_REGISTRATION_TITLE}</h2>
      <h3>{COACH_SESSION_REGISTRATION_FORM_LABELS.SELECT_COACHING_SESSION}</h3>
      <ToggleButtons
        onClick={handleSessionButtonClicked}
        buttonsGroup={coachingSessionOptions}
        buttonRef={sessionButtonRef}
        selected={selectedSession}
      />
      <br />
      <h3>{COACH_SESSION_REGISTRATION_FORM_LABELS.SESSION_DATE}</h3>
      <label htmlFor="date">{COACH_SESSION_REGISTRATION_FORM_LABELS.DATE_LABEL}</label>
      <DatePicker id="date" selectedDate={selectedDate} onDateChange={handleDateSelected} />
      <br />
      <h3>{COACH_SESSION_REGISTRATION_FORM_LABELS.FULL_NAME}</h3>
      <form onSubmit={handleSubmitRegistration}>
        <label htmlFor="fname">{COACH_SESSION_REGISTRATION_FORM_LABELS.FIRST_NAME}</label>
        <input 
          type="text" 
          id="fname" 
          name="fname" 
          required 
          value={firstName}
          onChange={handleFirstNameChange}
          disabled={isAuthenticated}
        />
        <br />
        <label htmlFor="lname">{COACH_SESSION_REGISTRATION_FORM_LABELS.LAST_NAME}</label>
        <input 
          type="text" 
          id="lname" 
          name="lname" 
          required 
          value={lastName}
          onChange={handleLastNameChange}
          disabled={isAuthenticated}
        />
        <br /><br />
        <br /><br />
        <ToggleButtons
          onClick={() => {}}
          buttonsGroup={[COACH_SESSION_REGISTRATION_FORM_LABELS.SUBMIT]}
          single={true}
          buttonRef={null}
          sx={{
            padding: '8px 16px',
            backgroundColor: '#e0e0e0',
            color: '#000',
            border: '2px solid #007bff',
            borderRadius: '4px',
          }}
          disabled={!isFormValid}
        />
      </form>
      {showConfirmationDialog && <ConfirmationDialog data={
        <div>
          <h3>{COACH_SESSION_REGISTRATION_FORM_LABELS.SUMMARY}</h3>
          <label>{COACH_SESSION_REGISTRATION_FORM_LABELS.TRAINING_GROUP}</label>
          <b>{sessionRegistrationData.sessionName}</b>
          <br />
          <label>{COACH_SESSION_REGISTRATION_FORM_LABELS.AGE_GROUP}</label>
          <b>{sessionRegistrationData.ageGroup}</b>
          <br />
          <label>{COACH_SESSION_REGISTRATION_FORM_LABELS.DATE_LABEL}</label>
          <b>{sessionRegistrationData.dates ? sessionRegistrationData.dates.toLocaleDateString?.() || sessionRegistrationData.dates : '-'}</b>
          <br />
          <label>{COACH_SESSION_REGISTRATION_FORM_LABELS.FIRST_NAME}</label>
          <b>{sessionRegistrationData.firstName}</b>
          <br />
          <label>{COACH_SESSION_REGISTRATION_FORM_LABELS.LAST_NAME}</label>
          <b>{sessionRegistrationData.lastName}</b>
          <br /><br />
        </div>
      }
        onConfirm={handleConfirmed}
        onCancel={handleCancelled} />
      }
        </>
      )}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
      
      {/* Coach PIN Dialog */}
      <CoachPinDialog
        open={showPinDialog}
        onClose={handleClosePinDialog}
        onLogin={handlePinLogin}
        onRegister={handlePinRegister}
        isLoading={loginLoading}
        error={loginError}
      />

      {/* Additional form fields and submission logic would go here */}
    </div>
  );
}

export default RegisterCoachingSession;