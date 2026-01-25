import { useRef, useState, useEffect } from 'react';
import { stringToDate, clearInputFields } from '../utils/formUtils';

export default function useRegisterCoachingSessionForm(sessions, onCreate) {
  const sessionButtonRef = useRef(null);

  const [formInitialized, setFormInitialized] = useState(false);
  const [selectedSession, setSelectedSession] = useState(
    Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [sessionRegistrationData, setSessionRegistrationData] = useState({});

  const initializeForm = () => {
    setSelectedSession(Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSessionRegistrationData({});
    setFormInitialized(true);
    clearInputFields(['fname', 'lname']);
    setTimeout(() => {
      sessionButtonRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    initializeForm();
  }, [sessions]);

  const handleSessionButtonClicked = (option) => setSelectedSession(option);
  const handleDateSelected = (date) => setSelectedDate(date);

  const handleSubmitRegistration = (event) => {
    event.preventDefault();
    let registrationData = {
      firstName: event.target.fname.value,
      lastName: event.target.lname.value,
      sessionName: selectedSession,
      dates: stringToDate(selectedDate),
    };
    setSessionRegistrationData(registrationData);
    setShowConfirmationDialog(true);
  };

  const handleConfirmed = () => {
    setShowConfirmationDialog(false);
    setFormInitialized(false);
    onCreate(sessionRegistrationData);
    initializeForm();
  };

  const handleCancelled = () => setShowConfirmationDialog(false);

  return {
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
  };
}
