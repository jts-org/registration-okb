/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useCallback, useContext } from 'react';
import { getUpcomingSessions, getRegistrations } from '../../services/Api';
import { LoadingContext } from '../../contexts/LoadingContext';

/**
 * Hook for fetching upcoming training sessions for trainees
 * Shows current and next week's sessions with registration counts
 */
export default function useUpcomingTraineeSessions() {
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
      // Fetch upcoming sessions (from weekly schedule)
      const sessionsResp = await getUpcomingSessions();
      const sessionsData = sessionsResp?.data || sessionsResp || [];
      
      // Check for error response from backend
      if (sessionsData.error) {
        setError(sessionsData.error);
        setSessions([]);
        return [];
      }

      // Fetch trainee registrations to count participants per session
      let registrationsData = [];
      try {
        const registrationsResp = await getRegistrations('trainee_registrations');
        registrationsData = registrationsResp?.data || registrationsResp || [];
      } catch (err) {
        console.warn('Could not fetch registrations for count:', err);
      }

      // Count registrations per session+date
      const registrationCounts = {};
      if (Array.isArray(registrationsData)) {
        registrationsData.forEach(reg => {
          // Registration schema: [ID, FirstName, LastName, SessionType, Date, AgeGroup, Age, Realized]
          if (!Array.isArray(reg) || reg.length < 5) return;
          
          const sessionType = String(reg[3] || '').toUpperCase();
          const dateObj = reg[4];
          
          // Format date to YYYY-MM-DD
          let dateStr = '';
          if (dateObj instanceof Date) {
            dateStr = dateObj.toISOString().split('T')[0];
          } else if (typeof dateObj === 'string') {
            dateStr = dateObj.split('T')[0];
          }
          
          const key = `${sessionType}|${dateStr}`;
          registrationCounts[key] = (registrationCounts[key] || 0) + 1;
        });
      }

      // Ensure each session has registration count
      const normalizedData = Array.isArray(sessionsData)
        ? sessionsData.map(session => {
            const key = `${session.sessionType}|${session.date}`;
            return {
              ...session,
              coaches: Array.isArray(session.coaches) ? session.coaches : [],
              registeredCount: registrationCounts[key] || 0
            };
          })
        : [];

      setSessions(normalizedData);
      return normalizedData;
    } catch (err) {
      console.error('Error fetching upcoming trainee sessions:', err);
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

  return { 
    sessions, 
    isLoading, 
    error,
    fetchSessions, 
    getSessionsByDate
  };
}
