/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useRef, useState, useEffect } from 'react';
import { stringToDate, clearInputFields } from '../../utils/formUtils';
import { copyTimePart } from '../../utils/formUtils';

export default function useRegisterCoachingSessionForm(sessions, onCreate) {
  const sessionButtonRef = useRef(null);

  const [formInitialized, setFormInitialized] = useState(false);
  const [selectedSession, setSelectedSession] = useState(
    Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [sessionRegistrationData, setSessionRegistrationData] = useState({});

  const initializeForm = () => {
    setSelectedSession(Array.isArray(sessions) && sessions.length === 1 ? sessions[0] : null);
    const now = new Date();
    setSelectedDate(now.toISOString().split('T')[0]);
    setSelectedStartTime(now);
    setSelectedEndTime(new Date(now.getTime() + 90 * 60000));
    setSessionRegistrationData({});
    setFormInitialized(true);
    clearInputFields(['fname', 'lname']);
    setTimeout(() => {
      sessionButtonRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const handleSessionButtonClicked = (option) => setSelectedSession(option);
  const handleDateSelected = (date) => setSelectedDate(date);
  const handleSelectedEndTime = (date) => setSelectedEndTime(copyTimePart(selectedDate, date));  
  const handleSelectedStartTime = (date) => setSelectedStartTime(copyTimePart(selectedDate, date));

  const handleSubmitRegistration = (event) => {
    event.preventDefault();
      let registrationData = {
        firstName: event.target.fname.value,
        lastName: event.target.lname.value,
        sessionName: selectedSession,
        dates: stringToDate(selectedDate),
       };
      // Add start/end times for VAPAA/SPARRI
      if (selectedSession === 'VAPAA/SPARRI') {
        registrationData.startTime = selectedStartTime;
        registrationData.endTime = selectedEndTime;
      }
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
    selectedStartTime,
    selectedEndTime,
    showConfirmationDialog,
    sessionRegistrationData,
    handleSessionButtonClicked,
    handleDateSelected,
    handleSelectedStartTime,
    handleSelectedEndTime,
    handleSubmitRegistration,
    handleConfirmed,
    handleCancelled,
  };
}
