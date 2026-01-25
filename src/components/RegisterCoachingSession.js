import { useState, useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DatePicker from './common/DatePicker';
import ConfirmationDialog from './ConfirmationDialog';
import useRegisterCoachingSessionForm from '../hooks/useRegisterCoachingSessionForm';
import { TAB_LABELS, COACHING_SESSION_OPTIONS, COACH_SESSION_REGISTRATION_FORM_LABELS } from '../constants';
import useCoachRegistrations from '../hooks/useCoachRegistrations';
import ToggleButtons from './common/ToggleButtons';

const tabs = [TAB_LABELS.MAIN];

function RegisterCoachingSession({ onSelect, coachingSessionOptions = COACHING_SESSION_OPTIONS, viewAsCoach = false }) {
  console.log("RegisterCoachingSession rendered with coachingSessionOptions:", coachingSessionOptions);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const handleFirstNameChange = e => setFirstName(e.target.value);
  const handleLastNameChange = e => setLastName(e.target.value);
  const tabButtonRef = useRef(null);

  const handleTabClick = (option) => {
    onSelect(option);
  };

  const { onNewCoachRegistration, isLoading: registrationsLoading } = useCoachRegistrations();

  const onCreate = (sessionRegistrationData) => {
    onNewCoachRegistration(sessionRegistrationData);
  };

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
        <input type="text" id="fname" name="fname" required onChange={handleFirstNameChange} />
        <br />
        <label htmlFor="lname">{COACH_SESSION_REGISTRATION_FORM_LABELS.LAST_NAME}</label>
        <input type="text" id="lname" name="lname" required onChange={handleLastNameChange} />
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
      {/* Additional form fields and submission logic would go here */}
    </div>
  );
}

export default RegisterCoachingSession;