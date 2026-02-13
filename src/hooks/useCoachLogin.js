/**
 * Hook for managing coach login state with PIN authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { registerCoachPin, verifyCoachPin, updateCoachLogin } from '../integrations/Api';

const STORAGE_KEY = 'okb_coach_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Custom hook for coach PIN login functionality
 */
function useCoachLogin() {
  const [coach, setCoach] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Check if session has expired
        if (session.expiry && Date.now() < session.expiry) {
          setCoach(session.coach);
          setIsAuthenticated(true);
        } else {
          // Session expired, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  /**
   * Save session to localStorage
   */
  const saveSession = useCallback((coachData, remember = true) => {
    if (remember && coachData) {
      const session = {
        coach: coachData,
        expiry: Date.now() + SESSION_EXPIRY
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, []);

  /**
   * Register a new coach with PIN
   * @param {string} firstName 
   * @param {string} lastName 
   * @param {string} pin 
   * @param {string} alias - Optional display alias
   * @returns {Object} - { success, message, coach? }
   */
  const register = useCallback(async (firstName, lastName, pin, alias = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerCoachPin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        pin: pin.toString(),
        alias: alias.trim()
      });

      if (response.id === 'exists') {
        setError('exists');
        return { success: false, message: 'exists' };
      }

      if (response.id === 'pin_taken') {
        setError('pin_taken');
        return { success: false, message: 'pin_taken' };
      }

      if (response.result === 'success' || response.id) {
        // Auto-login after registration
        const coachData = {
          id: response.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          alias: alias.trim()
        };
        setCoach(coachData);
        setIsAuthenticated(true);
        saveSession(coachData);
        return { success: true, message: 'registered', coach: coachData };
      }

      setError('registration_failed');
      return { success: false, message: 'registration_failed' };
    } catch (err) {
      console.error('Registration error:', err);
      setError('registration_failed');
      return { success: false, message: 'registration_failed' };
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  /**
   * Verify PIN and login
   * @param {string} pin 
   * @param {boolean} remember - Save session to localStorage
   * @returns {Object} - { success, message, coach? }
   */
  const login = useCallback(async (pin, remember = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyCoachPin(pin.toString());

      if (response.result === 'success' && response.coach) {
        setCoach(response.coach);
        setIsAuthenticated(true);
        if (remember) {
          saveSession(response.coach);
        }
        return { success: true, message: 'verified', coach: response.coach };
      }

      // Handle specific error messages
      const errorMessage = response.message || 'verification_failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      console.error('Login error:', err);
      setError('verification_failed');
      return { success: false, message: 'verification_failed' };
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    setCoach(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Update coach alias
   * @param {string} newAlias 
   * @returns {Object} - { success, message }
   */
  const updateAlias = useCallback(async (newAlias) => {
    if (!coach?.id) {
      return { success: false, message: 'not_authenticated' };
    }

    setIsLoading(true);
    try {
      const response = await updateCoachLogin({
        id: coach.id,
        alias: newAlias.trim()
      });

      if (response.result === 'success' || response.id) {
        const updatedCoach = { ...coach, alias: newAlias.trim() };
        setCoach(updatedCoach);
        saveSession(updatedCoach);
        return { success: true, message: 'updated' };
      }

      return { success: false, message: 'update_failed' };
    } catch (err) {
      console.error('Update alias error:', err);
      return { success: false, message: 'update_failed' };
    } finally {
      setIsLoading(false);
    }
  }, [coach, saveSession]);

  /**
   * Update PIN
   * @param {string} newPin 
   * @returns {Object} - { success, message }
   */
  const updatePin = useCallback(async (newPin) => {
    if (!coach?.id) {
      return { success: false, message: 'not_authenticated' };
    }

    setIsLoading(true);
    try {
      const response = await updateCoachLogin({
        id: coach.id,
        pin: newPin.toString()
      });

      if (response.result === 'success' || response.id) {
        return { success: true, message: 'pin_updated' };
      }

      return { success: false, message: 'update_failed' };
    } catch (err) {
      console.error('Update PIN error:', err);
      return { success: false, message: 'update_failed' };
    } finally {
      setIsLoading(false);
    }
  }, [coach]);

  /**
   * Get display name (alias if set, otherwise full name)
   */
  const getDisplayName = useCallback(() => {
    if (!coach) return '';
    if (coach.alias) return coach.alias;
    return `${coach.firstName} ${coach.lastName}`;
  }, [coach]);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    coach,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    register,
    login,
    logout,
    updateAlias,
    updatePin,
    clearError,
    
    // Helpers
    getDisplayName,
  };
}

export default useCoachLogin;
