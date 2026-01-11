const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://script.google.com/macros/s/';
const DEPLOYMENT_ID = process.env.REACT_APP_API_DEPLOYMENT_ID;

if (!DEPLOYMENT_ID) {
  console.error('REACT_APP_API_DEPLOYMENT_ID is not configured. Please set it in your .env file.');
}

const API_URL = `${API_BASE_URL}${DEPLOYMENT_ID}/exec`;

const composeUrl = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${API_URL}?${queryString}` : API_URL;
};

const get = async (params = {}) => {
  return await fetch(composeUrl(params), {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    }
  });
};

const post = async (payload) => {
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

const getSessions = async () => {
  try {
    return await get({ fetch: 'sessions' });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

const getCamps = async () => {
  try {
    return await get({ fetch: 'camps' });
  } catch (error) {
    console.error('Error fetching camps:', error);
    throw error;
  }
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

export { getSettings, getRegistrations, getSessions, getCamps, postRegistration };