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
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedAge, setSelectedAge] = useState('15');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [sessionRegistrationData, setSessionRegistrationData] = useState({});

  const initializeForm = () => {
  setSelectedSession(Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null);
    setSelectedAgeGroup(null);
    setSelectedAge('15');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSessionRegistrationData({});
    setFormInitialized(true);
    clearInputFields(['fname', 'lname', 'age']);
    setTimeout(() => {
      sessionButtonRef.current?.focus();
      ageGroupButtonRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    initializeForm();
  }, [sessions]);

  const handleSessionButtonClicked = (option) => setSelectedSession(option);
  const handleAgeGroupButtonClicked = (option) => {
    setSelectedAgeGroup(option);
    // Clear age when switching away from under-18
    if (option !== ageGroups[1]) {
      setSelectedAge('');
    }
  };
  const handleDateSelected = (date) => setSelectedDate(date);
  const handleAgeChange = (age) => setSelectedAge(age);

  const handleSubmitRegistration = (event) => {
    event.preventDefault();
    let registrationData = {
      firstName: event.target.fname.value,
      lastName: event.target.lname.value,
      ageGroup: selectedAgeGroup,
      sessionName: selectedSession,
      dates: stringToDate(selectedDate),
    };
    // Add age only for under-18
    if (selectedAgeGroup === ageGroups[1] && selectedAge) {
      registrationData.age = parseInt(selectedAge, 10);
    }
    setSessionRegistrationData(registrationData);
    setShowConfirmationDialog(true);
  };

  // Check if form is valid - age required for under-18
  const isMinor = selectedAgeGroup === ageGroups[1];
  const isAgeValid = !isMinor || (selectedAge && parseInt(selectedAge, 10) >= 1 && parseInt(selectedAge, 10) <= 17);

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
  };
}