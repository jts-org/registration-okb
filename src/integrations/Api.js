/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://script.google.com/macros/s/';
const DEPLOYMENT_ID = process.env.REACT_APP_API_DEPLOYMENT_ID;

if (!DEPLOYMENT_ID) {
  console.error('REACT_APP_API_DEPLOYMENT_ID is not configured. Please set it in your .env file.');
}

const API_URL = `${API_BASE_URL}${DEPLOYMENT_ID}/exec`;

// Simple in-memory cache with expiry
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (keyPrefix) => {
  if (keyPrefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) cache.delete(key);
    }
  } else {
    cache.clear();
  }
};

const composeUrl = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${API_URL}?${queryString}` : API_URL;
};

const get = async (params = {}, useCache = true) => {
  const cacheKey = JSON.stringify(params);
  
  if (useCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  const response = await fetch(composeUrl(params), {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    }
  });
  
  // Parse and cache the response
  const data = await response.json();
  if (useCache) {
    setCache(cacheKey, data);
  }
  return data;
};

const post = async (payload) => {
  // Clear relevant cache on mutations
  const role = payload?.path?.role;
  if (role === 'camp') {
    // Clear all camp-related cache entries
    for (const key of cache.keys()) {
      if (key.includes('camps')) cache.delete(key);
    }
  }
  if (role === 'session') {
    // Clear all session-related cache entries
    for (const key of cache.keys()) {
      if (key.includes('sessions')) cache.delete(key);
    }
  }
  if (role === 'trainee' || role === 'coach') clearCache();
  
  return await fetch(composeUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });
};

const getSettings = async (target) => {
  try {
    return await get({ fetch: target });
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

const getRegistrations = async (target) => {
  try {
    return await get({ fetch: target });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
};

const getSessions = async (forceRefresh = false) => {
  try {
    return await get({ fetch: 'sessions' }, !forceRefresh);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

const getCamps = async (forceRefresh = false) => {
  try {
    return await get({ fetch: 'camps' }, !forceRefresh);
  } catch (error) {
    console.error('Error fetching camps:', error);
    throw error;
  }
};

/**
 * Get upcoming sessions for current and next week with registered coaches
 * Always fetches fresh data (no cache) to show latest registrations
 */
const getUpcomingSessions = async () => {
  try {
    const fetched = await get({ fetch: 'upcoming_sessions' }, false);
    console.log("Api - getUpcomingSessions response: ", fetched);
    return fetched;
    //return await get({ fetch: 'upcoming_sessions' }, false);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    throw error;
  }
};

// Fetch both camps and sessions in parallel for faster loading
const getSessionsAndCamps = async () => {
  try {
    const [sessions, camps] = await Promise.all([
      get({ fetch: 'sessions' }),
      get({ fetch: 'camps' })
    ]);
    return { sessions, camps };
  } catch (error) {
    console.error('Error fetching sessions and camps:', error);
    throw error;
  }
};

// Prefetch data without awaiting - fire and forget
const prefetchData = () => {
  get({ fetch: 'sessions' }).catch(() => {});
  get({ fetch: 'camps' }).catch(() => {});
};

const postRegistration = async (registrationData, role, operation) => {
  try {
    const payload = {
      path: { role, operation },
      data: registrationData
    };
    return await post(payload);
  } catch (error) {
    console.error('Error posting registration:', error);
    throw error;
  }
};

// Camp management functions
const addCamp = async (campData) => {
  try {
    const payload = {
      path: { role: 'camp', operation: 'add' },
      data: campData
    };
    return await post(payload);
  } catch (error) {
    console.error('Error adding camp:', error);
    throw error;
  }
};

const updateCamp = async (campData) => {
  try {
    const payload = {
      path: { role: 'camp', operation: 'update' },
      data: campData
    };
    return await post(payload);
  } catch (error) {
    console.error('Error updating camp:', error);
    throw error;
  }
};

const deleteCamp = async (campId) => {
  try {
    const payload = {
      path: { role: 'camp', operation: 'delete' },
      data: { id: campId }
    };
    return await post(payload);
  } catch (error) {
    console.error('Error deleting camp:', error);
    throw error;
  }
};

// Session management functions
const addSession = async (sessionData) => {
  try {
    const payload = {
      path: { role: 'session', operation: 'add' },
      data: sessionData
    };
    return await post(payload);
  } catch (error) {
    console.error('Error adding session:', error);
    throw error;
  }
};

const updateSession = async (sessionData) => {
  try {
    const payload = {
      path: { role: 'session', operation: 'update' },
      data: sessionData
    };
    return await post(payload);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

const deleteSession = async (sessionId) => {
  try {
    const payload = {
      path: { role: 'session', operation: 'delete' },
      data: { id: sessionId }
    };
    return await post(payload);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

const getCoachesExperience = async () => {
  try {
    return await get({ fetch: 'coaches_experience' });
  } catch (error) {
    console.error('Error fetching coaches experience:', error);
    throw error;
  }
};

// ============================================
// COACH LOGIN API FUNCTIONS
// ============================================

/**
 * Get all coach logins (without PIN for security)
 */
const getCoachLogins = async () => {
  try {
    return await get({ fetch: 'coach_logins' });
  } catch (error) {
    console.error('Error fetching coach logins:', error);
    throw error;
  }
};

/**
 * Register a new coach with PIN
 * @param {Object} coachData - { firstName, lastName, alias?, pin }
 * @returns {Object} - { result, id }
 */
const registerCoachPin = async (coachData) => {
  try {
    const payload = {
      path: { role: 'coach_login', operation: 'register' },
      data: coachData
    };
    const response = await post(payload);
    return await response.json();
  } catch (error) {
    console.error('Error registering coach PIN:', error);
    throw error;
  }
};

/**
 * Verify coach PIN and get coach data
 * @param {string} pin 
 * @returns {Object} - { result, coach, message }
 */
const verifyCoachPin = async (pin) => {
  try {
    const payload = {
      path: { role: 'coach_login', operation: 'verify' },
      data: { pin }
    };
    const response = await post(payload);
    return await response.json();
  } catch (error) {
    console.error('Error verifying coach PIN:', error);
    throw error;
  }
};

/**
 * Update coach login (alias or PIN)
 * @param {Object} updateData - { id, alias?, pin? }
 */
const updateCoachLogin = async (updateData) => {
  try {
    const payload = {
      path: { role: 'coach_login', operation: 'update' },
      data: updateData
    };
    const response = await post(payload);
    return await response.json();
  } catch (error) {
    console.error('Error updating coach login:', error);
    throw error;
  }
};

/**
 * Delete coach login
 * @param {number} coachId 
 */
const deleteCoachLogin = async (coachId) => {
  try {
    const payload = {
      path: { role: 'coach_login', operation: 'delete' },
      data: { id: coachId }
    };
    const response = await post(payload);
    return await response.json();
  } catch (error) {
    console.error('Error deleting coach login:', error);
    throw error;
  }
};

export { getSettings, getRegistrations, getSessions, getCamps, getUpcomingSessions, getSessionsAndCamps, prefetchData, postRegistration, addCamp, updateCamp, deleteCamp, addSession, updateSession, deleteSession, getCoachesExperience, getCoachLogins, registerCoachPin, verifyCoachPin, updateCoachLogin, deleteCoachLogin };