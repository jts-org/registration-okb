/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useContext, useCallback } from "react";
import { getRegistrations } from '../../services/Api';
import register from '../../services/registrationApiUtils';
import { LoadingContext } from '../../contexts/LoadingContext';
import { findMatchingRegistrationEntry, dateStringToDate } from '../../utils/registrationUtils';

export default function useTraineeRegistrations() {
  const [traineeRegistrations, setTraineeRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useContext(LoadingContext);


  const fetchTraineeRegistrationsFromServer = useCallback(async () => {
    // set both local and global loading so UI shows the app-level spinner immediately
    try { showLoading(); } catch (e) {}
    setIsLoading(true);
    try {
      const response = await getRegistrations("trainee_registrations");
      const body = response instanceof Response ? await response.json() : response;
      const mappedTraineeRegistrationData = (body.data || []).map(entry => ({
        id: entry[0],
        firstName: entry[1],
        lastName: entry[2],
        ageGroup: entry[3],
        sessionName: entry[4],
        date: dateStringToDate(entry[5])
      }));
      setTraineeRegistrations(mappedTraineeRegistrationData);
      return mappedTraineeRegistrationData;
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }
  }, [showLoading, hideLoading]);

  const registerTraineeSession = async (sessionRegistrationData) => {
    try { showLoading(); } catch (e) {}
    setIsLoading(true);
    try {
      const latest = await fetchFromServer();
      const source = Array.isArray(latest) ? latest : traineeRegistrations;
      let matchingEntry = findMatchingRegistrationEntry(sessionRegistrationData, source);
      if (matchingEntry) {
        // Registration already exists
        return { success: true, exists: true };
      } else {
        const id = await register(sessionRegistrationData, "trainee", "add");
        if (id > 0) {
          const registered = { ...sessionRegistrationData, id: id };
          setTraineeRegistrations(prev => [...prev, registered]);
          return { success: true, exists: false };
        }
        return { success: false, exists: false };
      }
    } catch (error) {
      console.error('Error posting trainee registration:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }    
  };

  const fetchFromServer = useCallback(() => fetchTraineeRegistrationsFromServer(), [fetchTraineeRegistrationsFromServer]);

  async function onNewTraineeRegistration(sessionRegistrationData) {
    try {
      return await registerTraineeSession(sessionRegistrationData);
    } catch (err) {
      console.error('Error registering trainee session:', err);
      return { success: false, error: err };
    }
  }

  return { onNewTraineeRegistration, fetchFromServer, traineeRegistrations, isLoading };
}