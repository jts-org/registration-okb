import { useState, useContext, useCallback } from 'react';
import { getRegistrations } from '../integrations/Api';
import { dateStringToDate, getLocalDate } from '../utils/registrationUtils';
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
        console.log('Fetched registrations:', body);
        const mappedCoachRegistrationData = (body.data || []).map(entry => ({
          id: entry[0],
          firstName: entry[1],
          lastName: entry[2],
          sessionName: entry[3],
          date: dateStringToDate(entry[4])
        }));
        setCoachRegistrations(mappedCoachRegistrationData);
        console.log('Mapped coach registrations:', mappedCoachRegistrationData);
        return mappedCoachRegistrationData;
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }
  }, [showLoading, hideLoading]);

  const registerCoachingSession = async (sessionRegistrationData) => {
    console.log("registerCoachingSession: registering session data:", sessionRegistrationData);
    try { showLoading(); } catch (e) {}
    setIsLoading(true);
    try {
      const latest = await fetchCoachRegistrationsFromServer();
      const source = Array.isArray(latest) ? latest : coachRegistrations;
      console.log("registerCoachingSession: using registrations for match:", source);
      let matchingEntry = findMatchingRegistrationEntry(sessionRegistrationData, source);
      if (matchingEntry) {
        console.log('Registration already exists:', matchingEntry);
      } else {
        const id = await register(sessionRegistrationData, "coach", "add");
        if (id > 0) {
          const registered = { ...sessionRegistrationData, id: id };
          setCoachRegistrations(prev => [...prev, registered]);
        }
      }
    } catch (e) {
      console.error('Error posting coach registration:', e);
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }
  };

  const fetchFromServer = useCallback(() => fetchCoachRegistrationsFromServer(), [fetchCoachRegistrationsFromServer]);

  function onNewCoachRegistration(sessionRegistrationData) {
    console.log("onNewCoachRegistration: new coach registration data:", sessionRegistrationData);
    registerCoachingSession(sessionRegistrationData).catch(error => {
      console.error('Error registering coaching session:', error);
    });
  }

  return { onNewCoachRegistration, fetchFromServer, coachRegistrations, isLoading };
};