/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useContext, useCallback } from 'react';
import { getRegistrations } from '../integrations/Api';
import { dateStringToDate } from '../utils/registrationUtils';
import { LoadingContext } from '../contexts/LoadingContext';
import register from '../utils/registrationApiUtils';
import { findMatchingRegistrationEntry } from '../utils/registrationUtils';

export default function useCoachRegistrations() {
  const [coachRegistrations, setCoachRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useContext(LoadingContext);

  const fetchCoachRegistrationsFromServer = useCallback(async () => {
    try { showLoading(); } catch (e) {}
    setIsLoading(true);
    try {
        const resp = await getRegistrations("coach_registrations");
        const body = resp instanceof Response ? await resp.json() : resp;
        const mappedCoachRegistrationData = (body.data || []).map(entry => ({
          id: entry[0],
          firstName: entry[1],
          lastName: entry[2],
          sessionName: entry[3],
          date: dateStringToDate(entry[4]),
          realized: entry.length > 5 ? entry[5] : true
        })).filter(entry => {
          // If realized missing, treat as TRUE
          return entry.realized === true || entry.realized === 'TRUE' || entry.realized === 1 || entry.realized === '';
        });
        setCoachRegistrations(mappedCoachRegistrationData);
        return mappedCoachRegistrationData;
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }
  }, [showLoading, hideLoading]);

  const registerCoachingSession = async (sessionRegistrationData) => {
    try { showLoading(); } catch (e) {}
    setIsLoading(true);
    try {
      const latest = await fetchCoachRegistrationsFromServer();
      const source = Array.isArray(latest) ? latest : coachRegistrations;
      let matchingEntry = findMatchingRegistrationEntry(sessionRegistrationData, source);
      if (matchingEntry) {
        // Registration already exists
        return { success: true, exists: true };
      } else {
        const id = await register(sessionRegistrationData, "coach", "add");
        if (id > 0) {
          const registered = { ...sessionRegistrationData, id: id };
          setCoachRegistrations(prev => [...prev, registered]);
          return { success: true, exists: false };
        }
        return { success: false, exists: false };
      }
    } catch (e) {
      console.error('Error posting coach registration:', e);
      return { success: false, error: e };
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }
  };

  const fetchFromServer = useCallback(() => fetchCoachRegistrationsFromServer(), [fetchCoachRegistrationsFromServer]);

  async function onNewCoachRegistration(sessionRegistrationData) {
    try {
      return await registerCoachingSession(sessionRegistrationData);
    } catch (error) {
      console.error('Error registering coaching session:', error);
      return { success: false, error };
    }
  }

  return { onNewCoachRegistration, fetchFromServer, coachRegistrations, isLoading };
};