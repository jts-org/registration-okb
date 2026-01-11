import { useState, useEffect, useCallback } from 'react';
import { getSettings } from '../integrations/Api';

export default function useSettings() {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function passwordStruct(password) {
    return { password };
  }

  function mapAdminSettingsDataToObject(settingsData) {
    const adminSettingsData = settingsData[0] || [];
    if (adminSettingsData.length < 2) return {};
    return passwordStruct(adminSettingsData[1]);
  }

  function mapCoachSettingsDataToObject(settingsData) {
    const coachSettingsData = settingsData[1] || [];
    if (coachSettingsData.length < 2) return {};
    return passwordStruct(coachSettingsData[1]);
  }

  // Fetch settings from server and update state. Returned so callers can reload on demand.
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetched = await getSettings('settings');
      const body = fetched instanceof Response ? await fetched.json() : fetched;
      console.log('Fetched settings:', body);

      const admin = mapAdminSettingsDataToObject(body.data || []);
      const coach = mapCoachSettingsDataToObject(body.data || []);
      const mapped = { admin, coach };
      console.log('Mapped settings:', mapped);
      setSettings(mapped);
      return mapped;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load using a stable function reference
    fetchSettings();
  }, [fetchSettings]);

  return { settings, reloadSettings: fetchSettings, isLoading };
}