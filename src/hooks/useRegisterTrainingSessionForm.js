import { useRef, useState, useEffect } from 'react';
import { stringToDate, clearInputFields } from '../utils/formUtils';

export default function useRegisterTrainingSessionForm(sessions, ageGroups, onCreate) {
  const sessionButtonRef = useRef(null);
  const ageGroupButtonRef = useRef(null);

  const [formInitialized, setFormInitialized] = useState(false);
  // Preselect session only when there's exactly one option
  const [selectedSession, setSelectedSession] = useState(
    Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(ageGroups[1]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [sessionRegistrationData, setSessionRegistrationData] = useState({});

  const initializeForm = () => {
  setSelectedSession(Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null);
    setSelectedAgeGroup(ageGroups[1]);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSessionRegistrationData({});
    setFormInitialized(true);
    clearInputFields(['fname', 'lname']);
    setTimeout(() => {
      sessionButtonRef.current?.focus();
      ageGroupButtonRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    initializeForm();
  }, [sessions]);

  const handleSessionButtonClicked = (option) => setSelectedSession(option);
  const handleAgeGroupButtonClicked = (option) => setSelectedAgeGroup(option);
  const handleDateSelected = (date) => setSelectedDate(date);

  const handleSubmitRegistration = (event) => {
    event.preventDefault();
    let registrationData = {
      firstName: event.target.fname.value,
      lastName: event.target.lname.value,
      ageGroup: selectedAgeGroup,
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
  };
}