/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useEffect, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import useUpcomingSessions from '../hooks/useUpcomingSessions';

const WEEKDAY_NAMES = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

const LABELS = {
  TITLE: 'Tulevat sessiot',
  NO_SESSIONS: 'Ei tulevia sessioita aikataulussa',
  COACHES: 'Vetäjät:',
  NO_COACHES: '—',
  REGISTER: 'Ilmoittaudu',
  ALREADY_REGISTERED: 'Olet ilmoittautunut',
  LOADING: 'Ladataan sessioita...',
  ERROR: 'Virhe ladattaessa sessioita',
  REFRESH: 'Päivitä',
  SETUP_REQUIRED: 'Viikkoaikataulu puuttuu',
};

/**
 * Format date string to Finnish format with weekday
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} weekday - 0=Mon, 1=Tue, ..., 6=Sun
 * @returns {string} - e.g., "Ma 17.2.2026"
 */
function formatDateWithWeekday(dateStr, weekday) {
  const [year, month, day] = dateStr.split('-');
  const dayName = WEEKDAY_NAMES[weekday] || '';
  return `${dayName} ${parseInt(day, 10)}.${parseInt(month, 10)}.${year}`;
}

/**
 * Component styles
 */
const styles = {
  container: {
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  refreshButton: {
    padding: '6px 12px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  dateGroup: {
    marginBottom: '16px',
  },
  dateHeader: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#e5e7bf',
    marginBottom: '8px',
    padding: '4px 0',
    borderBottom: '2px solid #1976d2',
  },
  sessionCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    color: '#000',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: '4px',
  },
  sessionDate: {
    fontWeight: 400,
    fontSize: '0.85rem',
    color: '#666',
  },
  sessionTime: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '4px',
  },
  sessionLocation: {
    fontSize: '0.8rem',
    color: '#888',
  },
  coachesRow: {
    fontSize: '0.85rem',
    color: '#555',
    marginTop: '4px',
  },
  coachList: {
    fontWeight: 500,
    color: '#333',
  },
  registerButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.85rem',
    minWidth: '100px',
  },
  registeredButton: {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'default',
    fontWeight: 500,
    fontSize: '0.85rem',
    minWidth: '100px',
  },
  disabledButton: {
    padding: '8px 16px',
    backgroundColor: '#bdbdbd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: 500,
    fontSize: '0.85rem',
    minWidth: '100px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    color: '#666',
  },
  error: {
    padding: '16px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '8px',
    textAlign: 'center',
  },
  noSessions: {
    padding: '24px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
};

/**
 * QuickCoachRegistration component
 * Shows upcoming sessions with registered coaches and allows quick registration
 * 
 * @param {Object} props
 * @param {boolean} props.isAuthenticated - Whether coach is logged in
 * @param {Object} props.coach - Current coach data { firstName, lastName }
 * @param {Function} props.onRegister - Called when registering: onRegister(sessionType, date)
 * @param {boolean} props.isRegistering - Whether a registration is in progress
 * @param {string} props.coachDisplayName - Display name of logged-in coach
 */
function QuickCoachRegistration({ 
  isAuthenticated = false, 
  coach = null,
  onRegister,
  isRegistering = false,
  coachDisplayName = '',
}) {
  const { 
    sessions, 
    isLoading, 
    error, 
    fetchSessions, 
    getSessionsByDate 
  } = useUpcomingSessions();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Check if current coach is registered for a session
  const isCoachRegistered = useCallback((session) => {
    if (!isAuthenticated || !coachDisplayName) return false;
    
    // Check if coach's display name or full name is in the coaches list
    const coachName = coachDisplayName.toLowerCase();
    const fullName = coach ? `${coach.firstName} ${coach.lastName}`.toLowerCase() : '';
    
    return session.coaches.some(c => {
      const registered = c.toLowerCase();
      return registered === coachName || registered === fullName;
    });
  }, [isAuthenticated, coachDisplayName, coach]);

  // Handle register click
  const handleRegister = useCallback((session) => {
    if (!isAuthenticated || !coach || !onRegister) return;
    
    onRegister({
      sessionType: session.sessionType,
      date: session.date,
      firstName: coach.firstName,
      lastName: coach.lastName,
    });
  }, [isAuthenticated, coach, onRegister]);

  // Render loading state
  if (isLoading && sessions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <CircularProgress size={20} style={{ marginRight: '8px' }} />
          {LABELS.LOADING}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error.includes('sheet') ? LABELS.SETUP_REQUIRED : LABELS.ERROR}: {error}
        </div>
      </div>
    );
  }

  const sessionsByDate = getSessionsByDate();
  const dates = Object.keys(sessionsByDate).sort();

  // Render no sessions
  if (dates.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>{LABELS.TITLE}</h3>
          <button style={styles.refreshButton} onClick={fetchSessions}>
            {LABELS.REFRESH}
          </button>
        </div>
        <div style={styles.noSessions}>
          {LABELS.NO_SESSIONS}
        </div>
      </div>
    );
  }

  console.log("Fetched sessions: ", sessions);
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{LABELS.TITLE}</h3>
        <button 
          style={styles.refreshButton} 
          onClick={fetchSessions}
          disabled={isLoading}
        >
          {isLoading ? '...' : LABELS.REFRESH}
        </button>
      </div>

      {dates.map(date => {
        const sessionsForDate = sessionsByDate[date];
        const firstSession = sessionsForDate[0];
        
        return (
          <div key={date} style={styles.dateGroup}>
            <div style={styles.dateHeader}>
              {formatDateWithWeekday(date, firstSession.weekday)}
            </div>
            
            {sessionsForDate.map((session, idx) => {
              const alreadyRegistered = isCoachRegistered(session);
              const canRegister = isAuthenticated && !alreadyRegistered && !isRegistering;
              
              return (
                <div
                  key={`${session.scheduleId}-${idx}`}
                  style={{
                    ...styles.sessionCard,
                    backgroundColor: session.coaches && session.coaches.length > 0 ? '#ccffcc' : '#ffcccc',
                  }}
                >
                  <div style={styles.sessionInfo}>
                    <div style={styles.sessionName}>{session.sessionType}</div>
                    <div style={styles.sessionDateTime}>
                      {session.startTime} – {session.endTime}
                    </div>
                    {session.location && (
                      <div style={styles.sessionLocation}>{session.location}</div>
                    )}
                    <div style={styles.sessionCoaches}>
                      Vetäjä: {session.coaches && session.coaches.length > 0 ? session.coaches.join(', ') : '—'}
                    </div>
                  </div>
                  {isAuthenticated ? (
                    alreadyRegistered ? (
                      <button style={styles.registeredButton} disabled>
                        ✓ {LABELS.ALREADY_REGISTERED}
                      </button>
                    ) : (
                      <button
                        style={canRegister ? styles.registerButton : styles.disabledButton}
                        onClick={() => handleRegister(session)}
                        disabled={!canRegister}
                      >
                        {isRegistering ? '...' : LABELS.REGISTER}
                      </button>
                    )
                  ) : (
                    <button style={styles.disabledButton} disabled>
                      {LABELS.REGISTER}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default QuickCoachRegistration;
