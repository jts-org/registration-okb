import { useRef, useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtons from "./common/ToggleButtons";
import DatePicker from './common/DatePicker';
import ConfirmationDialog from './ConfirmationDialog';
import useRegisterTrainingSessionForm from '../hooks/useRegisterTrainingSessionForm';
import useTraineeRegistrations from '../hooks/useTraineeRegistrations';
import { TAB_LABELS, SESSION_OPTIONS, AGE_GROUP_OPTIONS, FORM_LABELS } from '../constants';
import '../App.css';

const tabs = [TAB_LABELS.MAIN];

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
    selectedDate,
    showConfirmationDialog,
    sessionRegistrationData,
    handleSessionButtonClicked,
    handleAgeGroupButtonClicked,
    handleDateSelected,
    handleSubmitRegistration,
    handleConfirmed,
    handleCancelled,
  } = useRegisterTrainingSessionForm(sessionOptions, AGE_GROUP_OPTIONS, onCreate);

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    !!selectedSession &&
    !!selectedAgeGroup;  

  if (!formInitialized) {
    return (
      <div style={{ position: 'relative' }}>
        <div>{FORM_LABELS.PROCESSING}</div>
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
      <h2>{FORM_LABELS.TRAINEE_REGISTRATION_TITLE}</h2>
      <h3>{FORM_LABELS.SELECT_TRAINING_GROUP}</h3>
      <ToggleButtons
        onClick={handleSessionButtonClicked}
        buttonsGroup={sessionOptions}
        buttonRef={sessionButtonRef}
        selected={selectedSession}
      />
      <br />
      <h3>{FORM_LABELS.SELECT_AGE_GROUP}</h3>
      <ToggleButtons
        onClick={handleAgeGroupButtonClicked}
        buttonsGroup={AGE_GROUP_OPTIONS}
        buttonRef={ageGroupButtonRef}
        selected={selectedAgeGroup}
      />
      <br />
      <h3>{FORM_LABELS.SESSION_DATE}</h3>
      <label htmlFor="date">{FORM_LABELS.DATE_LABEL}</label>
      <DatePicker
        onDateChange={handleDateSelected}
        selectedDate={selectedDate}
      />
      <br />
      <h3>{FORM_LABELS.FULL_NAME}</h3>
      <form onSubmit={handleSubmitRegistration}>
        <label htmlFor="fname">{FORM_LABELS.FIRST_NAME}</label>
        <input type="text" id="fname" name="fname" required onChange={handleFirstNameChange} />
        <br />
        <label htmlFor="lname">{FORM_LABELS.LAST_NAME}</label>
        <input type="text" id="lname" name="lname" required onChange={handleLastNameChange} />
        <br /><br />
        <br /><br />
        <ToggleButtons
          onClick={() => {}}
          buttonsGroup={[FORM_LABELS.SUBMIT]}
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
          <h3>{FORM_LABELS.SUMMARY}</h3>
          <label>{FORM_LABELS.TRAINING_GROUP}</label>
          <b>{sessionRegistrationData.sessionName}</b>
          <br />
          <label>{FORM_LABELS.AGE_GROUP}</label>
          <b>{sessionRegistrationData.ageGroup}</b>
          <br />
          <label>{FORM_LABELS.DATE_LABEL}</label>
          <b>{sessionRegistrationData.dates ? sessionRegistrationData.dates.toLocaleDateString?.() || sessionRegistrationData.dates : '-'}</b>
          <br />
          <label>{FORM_LABELS.FIRST_NAME}</label>
          <b>{sessionRegistrationData.firstName}</b>
          <br />
          <label>{FORM_LABELS.LAST_NAME}</label>
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