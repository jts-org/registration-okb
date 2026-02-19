/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useCallback, useContext } from 'react';
import { getUpcomingSessions, removeCoachFromSession } from '../integrations/Api';
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
    setIsLoading(true);
    setError(null);
    try {
      showLoading?.();
    } catch (e) { /* LoadingContext might not be available */ }

    try {
      const resp = await getUpcomingSessions();
      const data = resp?.data || resp || [];
      
      // Check for error response from backend
      if (data.error) {
        setError(data.error);
        setSessions([]);
        return [];
      }
      
      // Ensure each session has a coaches array (even if empty)
      const normalizedData = Array.isArray(data)
        ? data.map(session => ({
            ...session,
            coaches: Array.isArray(session.coaches) ? session.coaches : []
          }))
        : [];

      setSessions(normalizedData);
      return normalizedData;
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
    const grouped = {};
    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });
    return grouped;
  }, [sessions]);

  const removeFromSession = useCallback(async (alias, sessionType, date) => {
    setIsLoading(true);
    setError(null);
    try {
      showLoading?.();
    } catch (e) { /* LoadingContext might not be available */ }

    try {
      const resp = await removeCoachFromSession(alias, sessionType, date);
      const data = resp?.data || resp || null;
      if (data?.error) {
        setError(data.error);
        return false;
      }
      // Refresh sessions after successful removal
      await fetchSessions();
      return true;
    } catch (err) {
      console.error('Error removing coach from session:', err);
      setError('Virhe poistaessa valmentajaa sessiosta');
    } finally {
      setIsLoading(false);
      try {
        hideLoading?.();
      } catch (e) { /* LoadingContext might not be available */ }
    }
  }, [fetchSessions, showLoading, hideLoading]);

  return { 
    sessions, 
    isLoading, 
    error,
    fetchSessions, 
    getSessionsByDate,
    removeFromSession
  };
}
