/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useState, useContext } from 'react';
import { LoadingContext } from '../../contexts/LoadingContext';
import { SESSION_OPTIONS } from '../../constants';
import { getCamps, getSessions } from '../../integrations/Api';
import { dateStringToDate, isValidDate, getLocalDate } from '../../utils/registrationUtils';

const useSessionOptions = () => {
  const { setLoading } = useContext(LoadingContext);
  const [trainingSessionOptions, setTrainingSessionOptions] = useState(SESSION_OPTIONS);

  const deriveCampLabels = (data, todayLocal) => {
    const labels = [];
    (Array.isArray(data) ? data : []).forEach(row => {
      if (!Array.isArray(row)) return;
      // Row schema: [id, type, name, coach, date1, count1, date2, count2, ...]
      const campName = row[2];
      const rest = row.slice(4);
      for (let i = 0; i + 1 < rest.length; i += 2) {
        const dateStr = rest[i];
        const count = Number(rest[i + 1]) || 0;
        const parsedLocal = dateStringToDate(dateStr);
        if (isValidDate(parsedLocal) && parsedLocal === todayLocal) {
          for (let k = 1; k <= count; k++) labels.push(`${campName} SESSIO ${k}`);
        }
      }
    });
    return labels;
  };

  const deriveSessionLabels = (data, todayLocal) => {
    const labels = [];
    (Array.isArray(data) ? data : []).forEach(row => {
      if (!Array.isArray(row)) return;
      // Row schema: [id, type, name, startDate, endDate, ...]
      const courseName = row[2];
      const startStr = row[3];
      const endStr = row[4];
      const start = dateStringToDate(startStr);
      const end = dateStringToDate(endStr);
      if (isValidDate(start) && isValidDate(end)) {
        if (todayLocal >= start && todayLocal <= end) labels.push(courseName);
      }
    });
    return labels;
  };

  const loadTrainingSessionOptions = async () => {
    try {
      setLoading(true);
      const resp = await getCamps();
      const body = resp instanceof Response ? await resp.json() : resp;
      const data = body.data;
      const todayLocal = getLocalDate();
      const campLabels = deriveCampLabels(data, todayLocal);
      if (campLabels.length > 1) {
        setTrainingSessionOptions([...(Array.isArray(campLabels) ? campLabels : []), ...SESSION_OPTIONS]);
      } else {
        // Fallback: fetch regular sessions and include those active today
        const sResp = await getSessions();
        const sBody = sResp instanceof Response ? await sResp.json() : sResp;
        const sData = sBody.data;
        const sessionLabels = deriveSessionLabels(sData, todayLocal);
        setTrainingSessionOptions([...(Array.isArray(sessionLabels) ? sessionLabels : []), ...SESSION_OPTIONS]);
      }
    } catch (e) {
      console.error('Error deriving session options:', e);
      setTrainingSessionOptions(SESSION_OPTIONS);
    } finally {
      setLoading(false);
    }
  };

  return {
    trainingSessionOptions,
    loadTrainingSessionOptions,
  };
};

export default useSessionOptions;
