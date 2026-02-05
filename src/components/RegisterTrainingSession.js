import { useRef, useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtons from "./common/ToggleButtons";
import DatePicker from './common/DatePicker';
import ConfirmationDialog from './ConfirmationDialog';
import useRegisterTrainingSessionForm from '../hooks/useRegisterTrainingSessionForm';
import useTraineeRegistrations from '../hooks/useTraineeRegistrations';
import { TAB_LABELS, SESSION_OPTIONS, AGE_GROUP_OPTIONS, TRAINEE_SESSION_REGISTRATION_FORM_LABELS } from '../constants';
import '../App.css';

const tabs = [TAB_LABELS.MAIN];

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

function RegisterTrainingSession({ onSelect, sessionOptions = SESSION_OPTIONS }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const handleFirstNameChange = e => setFirstName(e.target.value);
  const handleLastNameChange = e => setLastName(e.target.value);
  const tabButtonRef = useRef(null);

  const handleTabClick = (option) => {
    onSelect(option);
  };


  const { onNewTraineeRegistration, isLoading: registrationsLoading } = useTraineeRegistrations();

  const onCreate = (sessionRegistrationData) => {

    onNewTraineeRegistration(sessionRegistrationData);
  };

  const {
    sessionButtonRef,
    ageGroupButtonRef,
    formInitialized,
    selectedSession,
    selectedAgeGroup,
    selectedAge,
    selectedDate,
    showConfirmationDialog,
    sessionRegistrationData,
    handleSessionButtonClicked,
    handleAgeGroupButtonClicked,
    handleAgeChange,
    handleDateSelected,
    handleSubmitRegistration,
    handleConfirmed,
    handleCancelled,
    isMinor,
    isAgeValid,
  } = useRegisterTrainingSessionForm(sessionOptions, AGE_GROUP_OPTIONS, onCreate);

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    !!selectedSession &&
    !!selectedAgeGroup &&
    isAgeValid;  

  if (!formInitialized) {
    return (
      <div style={{ position: 'relative' }}>
        <div>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.PROCESSING}</div>
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
            background: 'rgba(255,255,255,0.6)',
            zIndex: 2000
          }}>
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="training-session-container">
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
      <h2>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.TRAINEE_REGISTRATION_TITLE}</h2>
      <h3>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.SELECT_TRAINING_GROUP}</h3>
      <ToggleButtons
        onClick={handleSessionButtonClicked}
        buttonsGroup={sessionOptions}
        buttonRef={sessionButtonRef}
        selected={selectedSession}
      />
      <br />
      <h3>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.SELECT_AGE_GROUP}</h3>
      <ToggleButtons
        onClick={handleAgeGroupButtonClicked}
        buttonsGroup={AGE_GROUP_OPTIONS}
        buttonRef={ageGroupButtonRef}
        selected={selectedAgeGroup}
      />
      {isMinor && (
        <div style={ageInputStyles.container}>
          <label htmlFor="age" style={ageInputStyles.label}>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.AGE}</label>
          <div style={ageInputStyles.inputWrapper}>
            <button 
              type="button"
              style={ageInputStyles.spinButton}
              onClick={() => handleAgeChange(Math.max(1, (parseInt(selectedAge) || 1) - 1).toString())}
            >
              −
            </button>
            <input
              type="number"
              id="age"
              name="age"
              min="1"
              max="17"
              value={selectedAge}
              onChange={(e) => handleAgeChange(e.target.value)}
              placeholder="—"
              style={ageInputStyles.input}
            />
            <button 
              type="button"
              style={ageInputStyles.spinButton}
              onClick={() => handleAgeChange(Math.min(17, (parseInt(selectedAge) || 0) + 1).toString())}
            >
              +
            </button>
          </div>
        </div>
      )}
      <br />
      <h3>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.SESSION_DATE}</h3>
      <label htmlFor="date">{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.DATE_LABEL}</label>
      <DatePicker
        onDateChange={handleDateSelected}
        selectedDate={selectedDate}
      />
      <br />
      <h3>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.FULL_NAME}</h3>
      <form onSubmit={handleSubmitRegistration}>
        <label htmlFor="fname">{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.FIRST_NAME}</label>
        <input type="text" id="fname" name="fname" required onChange={handleFirstNameChange} />
        <br />
        <label htmlFor="lname">{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.LAST_NAME}</label>
        <input type="text" id="lname" name="lname" required onChange={handleLastNameChange} />
        <br /><br />
        <br /><br />
        <ToggleButtons
          onClick={() => {}}
          buttonsGroup={[TRAINEE_SESSION_REGISTRATION_FORM_LABELS.SUBMIT]}
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
          <h3>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.SUMMARY}</h3>
          <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.TRAINING_GROUP}</label>
          <b>{sessionRegistrationData.sessionName}</b>
          <br />
          <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.AGE_GROUP}</label>
          <b>{sessionRegistrationData.ageGroup}</b>
          <br />
          {sessionRegistrationData.age && (
            <>
              <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.AGE}</label>
              <b>{sessionRegistrationData.age}</b>
              <br />
            </>
          )}
          <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.DATE_LABEL}</label>
          <b>{sessionRegistrationData.dates ? sessionRegistrationData.dates.toLocaleDateString?.() || sessionRegistrationData.dates : '-'}</b>
          <br />
          <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.FIRST_NAME}</label>
          <b>{sessionRegistrationData.firstName}</b>
          <br />
          <label>{TRAINEE_SESSION_REGISTRATION_FORM_LABELS.LAST_NAME}</label>
          <b>{sessionRegistrationData.lastName}</b>
          <br /><br />
        </div>
      }
        onConfirm={handleConfirmed}
        onCancel={handleCancelled} />
      }
    </div>
  );
}

export default RegisterTrainingSession;