import { useState, useContext, useCallback } from "react";
import { getRegistrations } from '../integrations/Api';
import register from '../utils/registrationApiUtils';
import { LoadingContext } from '../contexts/LoadingContext';
import { findMatchingRegistrationEntry, dateStringToDate } from '../utils/registrationUtils';

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
      console.log('Fetched registrations:', body);
      const mappedTraineeRegistrationData = (body.data || []).map(entry => ({
        id: entry[0],
        firstName: entry[1],
        lastName: entry[2],
        ageGroup: entry[3],
        sessionName: entry[4],
        date: dateStringToDate(entry[5])
      }));
      setTraineeRegistrations(mappedTraineeRegistrationData);
      console.log('Mapped trainee registrations:', mappedTraineeRegistrationData);
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
      console.log("registerTraineeSession: using registrations for match:", source);
      let matchingEntry = findMatchingRegistrationEntry(sessionRegistrationData, source);
      if (matchingEntry) {
        console.log('Registration already exists:', matchingEntry);
        // TODO: Implement update logic when needed
      } else {
        const id = await register(sessionRegistrationData, "trainee", "add");
        if (id > 0) {
          const registered = { ...sessionRegistrationData, id: id };
          setTraineeRegistrations(prev => [...prev, registered]);
        }
      }
    } catch (error) {
      console.error('Error posting trainee registration:', error);
    } finally {
      setIsLoading(false);
      try { hideLoading(); } catch (e) {}
    }    
  };

  const fetchFromServer = useCallback(() => fetchTraineeRegistrationsFromServer(), [fetchTraineeRegistrationsFromServer]);

  function onNewTraineeRegistration(sessionRegistrationData) {
    console.log("onNewTraineeRegistration: New trainee registration:", sessionRegistrationData);
    // fire-and-forget: let registerTraineeSession handle async work and errors
    registerTraineeSession(sessionRegistrationData).catch(err => console.error(err));
  }

  return { onNewTraineeRegistration, fetchFromServer, traineeRegistrations, isLoading };
}