/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useCallback, useContext } from 'react';
import { getUpcomingSessions } from '../integrations/Api';
import { LoadingContext } from '../contexts/LoadingContext';

/**
 * Hook for fetching upcoming sessions with registered coaches
 * Used for quick coach registration feature
 */
export default function useUpcomingSessions() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useContext(LoadingContext);

  const fetchSessions = useCallback(async () => {
    console.log("Fetching upcoming sessions...");
    setIsLoading(true);
    setError(null);
    try {
      showLoading?.();
    } catch (e) { /* LoadingContext might not be available */ }

    try {
      const resp = await getUpcomingSessions();
      const data = resp?.data || resp || [];
      console.log("Hook -Received sessions data: ", data);
      
      // Check for error response from backend
      if (data.error) {
        setError(data.error);
        setSessions([]);
        return [];
      }
      
      setSessions(Array.isArray(data) ? data : []);
      console.log("Sessions: ", sessions);
      return sessions;
      /*
      // Filter out coaches with Realized FALSE in session.coaches if needed (handled in backend, but double-check)
      const filtered = Array.isArray(data) ? data.map(session => {
        if (!session.coachDetails) return session;
        console.log("session.coachDetails: ", session.coachDetails);
        // If session.coachDetails exists, filter
        return {
          ...session,
          coaches: Array.isArray(session.coachDetails)
            ? session.coachDetails.filter(c => c.realized === true || c.realized === 'TRUE' || c.realized === 1 || c.realized === '')
            : session.coaches
        };
      }) : [];
      setSessions(filtered);
      return filtered;
      */
    } catch (err) {
      console.error('Error fetching upcoming sessions:', err);
      setError('Virhe haettaessa sessioita');
      return [];
    } finally {
      setIsLoading(false);
      try {
        hideLoading?.();
      } catch (e) { /* LoadingContext might not be available */ }
    }
  }, [showLoading, hideLoading]);

  /**
   * Group sessions by date for display
   * @returns {Object} - { '2026-02-17': [...sessions], '2026-02-18': [...] }
   */
  const getSessionsByDate = useCallback(() => {
    console.log("Grouping sessions by date...", sessions);
    const grouped = {};
    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });
    console.log("Grouped sessions: ", grouped);
    return grouped;
  }, [sessions]);

  return { 
    sessions, 
    isLoading, 
    error,
    fetchSessions, 
    getSessionsByDate 
  };
}
