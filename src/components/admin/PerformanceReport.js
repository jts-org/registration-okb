import { useState, useEffect, useCallback } from 'react';
import { getRegistrations, getCamps, getCoachesExperience } from '../../integrations/Api';
import { SkeletonList } from '../common/Skeleton';

const LABELS = {
  TITLE: 'Suoritemääräraportti',
  OVER_18: 'Yli 18-vuotiaat',
  UNDER_18: 'Alle 18-vuotiaat',
  COACHES: 'Valmentajat:',
  GROUP: 'Joukkue/ryhmä',
  PERSON_COUNT: 'Hlö-määrä',
  PERFORMANCE_COUNT: 'Suoritemäärä',
  COACH_NAME: 'Nimi',
  COACH_GROUPS: 'Valmennus/ohjausryhmä',
  COACH_HOURS: 'Ohjaustyötä tuntia/vuosi',
  COACH_EXPERIENCE: 'Koulutuskokemus',
  NO_DATA: 'Ei tietoja',
  LOADING: 'Ladataan...',
  REFRESH: '🔄 Päivitä',
  TOTAL: 'Yhteensä',
};

/**
 * Extract camp name from session name (remove "SESSIO X" part)
 */
function extractCampName(sessionName, campNames) {
  const upper = String(sessionName).trim().toUpperCase();
  
  // Check if this session is a camp session
  for (const campName of campNames) {
    if (upper.startsWith(campName)) {
      return campName;
    }
  }
  
  return upper;
}

/**
 * Check if a session is a camp session
 */
function isCampSession(sessionName, campNames) {
  const upper = String(sessionName).trim().toUpperCase();
  for (const campName of campNames) {
    if (upper.startsWith(campName)) {
      return true;
    }
  }
  return false;
}

/**
 * Process trainee data into report format
 * Trainees data format: [id, firstName, lastName, ageGroup, sessionName, date, ...]
 */
function processTraineeData(trainees, campNames, isOver18) {
  const ageFilter = isOver18 ? '18+ vuotias' : 'alle 18-vuotias';
  
  // Filter by age group
  const filtered = trainees.filter(row => {
    const ageGroup = String(row[3]).trim();
    return ageGroup === ageFilter;
  });

  // Group by session (normalize camp sessions to just camp name)
  const sessionStats = {};

  filtered.forEach(row => {
    const firstName = String(row[1]).trim();
    const lastName = String(row[2]).trim();
    const sessionName = String(row[4]).trim().toUpperCase();
    
    // Get normalized session name (camp name for camp sessions)
    let normalizedSession;
    if (isCampSession(sessionName, campNames)) {
      normalizedSession = extractCampName(sessionName, campNames);
    } else {
      normalizedSession = sessionName;
    }
    
    if (!sessionStats[normalizedSession]) {
      sessionStats[normalizedSession] = {
        uniquePersons: new Set(),
        totalParticipations: 0,
      };
    }
    
    const personKey = `${firstName} ${lastName}`;
    sessionStats[normalizedSession].uniquePersons.add(personKey);
    sessionStats[normalizedSession].totalParticipations++;
  });

  // Convert to array format for display
  const result = Object.entries(sessionStats).map(([session, stats]) => ({
    session,
    personCount: stats.uniquePersons.size,
    performanceCount: stats.totalParticipations,
  }));

  // Sort alphabetically by session name
  result.sort((a, b) => a.session.localeCompare(b.session));

  return result;
}

/**
 * Process coach data into report format
 * Coaches data format: [id, firstName, lastName, sessionName, date]
 * @param {Array} coaches - Coach registration data
 * @param {Object} experienceMap - Map of coach name to experience years
 */
function processCoachData(coaches, experienceMap = {}) {
  const coachData = {};

  coaches.forEach(row => {
    const firstName = String(row[1]).trim();
    const lastName = String(row[2]).trim();
    const sessionName = String(row[3]).trim().toUpperCase();
    
    if (!firstName || !lastName) return;
    
    const coachName = `${firstName} ${lastName}`;
    
    if (!coachData[coachName]) {
      coachData[coachName] = { sessions: new Set(), totalRegistrations: 0 };
    }
    
    if (sessionName) {
      coachData[coachName].sessions.add(sessionName);
      coachData[coachName].totalRegistrations++;
    }
  });

  // Convert to array and sort by name
  // Hours = total registrations * 1.5
  const result = Object.entries(coachData).map(([name, data]) => ({
    name,
    sessions: Array.from(data.sessions).sort().join(', '),
    hours: data.totalRegistrations * 1.5,
    experience: experienceMap[name] || 0,
  }));

  result.sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

/**
 * Parse coaches experience data into a map
 * Experience data format: [header_row, ...data_rows]
 * Header: [Nimi, 2025, 2026, ...]
 * Data: [name, exp_2025, exp_2026, ...]
 */
function parseExperienceData(data) {
  if (!data || data.length < 2) return {};
  
  const header = data[0];
  const currentYear = new Date().getFullYear();
  
  // Find the current year column or the last year with data
  let yearColIndex = -1;
  for (let i = header.length - 1; i >= 1; i--) {
    const year = Number(header[i]);
    if (year === currentYear) {
      yearColIndex = i;
      break;
    }
    if (year && year < currentYear && yearColIndex === -1) {
      yearColIndex = i; // Use last available year if current year not found
    }
  }
  
  if (yearColIndex === -1) return {};
  
  const experienceMap = {};
  for (let i = 1; i < data.length; i++) {
    const name = String(data[i][0]).trim();
    const exp = Number(data[i][yearColIndex]) || 0;
    if (name) {
      experienceMap[name] = exp;
    }
  }
  
  return experienceMap;
}

function PerformanceReport({ onLoading }) {
  const [over18Data, setOver18Data] = useState([]);
  const [under18Data, setUnder18Data] = useState([]);
  const [coachData, setCoachData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch trainees, coaches, camps, and experience in parallel
      const [traineesResp, coachesResp, campsResp, experienceResp] = await Promise.all([
        getRegistrations('trainee_registrations'),
        getRegistrations('coach_registrations'),
        getCamps(),
        getCoachesExperience(),
      ]);

      const trainees = traineesResp.data || [];
      const coaches = coachesResp.data || [];
      const camps = campsResp.data || [];
      const experienceData = experienceResp.data || [];

      // Extract camp names from camps data
      // Camps format: [id, "camp", name, teacher, ...]
      const campNames = new Set();
      camps.forEach(row => {
        const name = String(row[2]).trim().toUpperCase();
        if (name) campNames.add(name);
      });

      // Parse experience data into map
      const experienceMap = parseExperienceData(experienceData);

      // Process data
      setOver18Data(processTraineeData(trainees, campNames, true));
      setUnder18Data(processTraineeData(trainees, campNames, false));
      setCoachData(processCoachData(coaches, experienceMap));
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (onLoading) onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleRefresh = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>{LABELS.TITLE}</h3>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{LABELS.TITLE}</h3>
        <button style={styles.refreshButton} onClick={handleRefresh}>
          {LABELS.REFRESH}
        </button>
      </div>

      {/* Over 18 Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>{LABELS.OVER_18}</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{LABELS.GROUP}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.PERSON_COUNT}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.PERFORMANCE_COUNT}</th>
            </tr>
          </thead>
          <tbody>
            {over18Data.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={3}>{LABELS.NO_DATA}</td>
              </tr>
            ) : (
              <>
                {over18Data.map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{row.session}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.personCount}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.performanceCount}</td>
                  </tr>
                ))}
                <tr style={styles.trTotal}>
                  <td style={{ ...styles.td, ...styles.tdTotal }}>{LABELS.TOTAL}</td>
                  <td style={{ ...styles.td, ...styles.tdNumber, ...styles.tdTotal }}>
                    {over18Data.reduce((sum, row) => sum + row.personCount, 0)}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdNumber, ...styles.tdTotal }}>
                    {over18Data.reduce((sum, row) => sum + row.performanceCount, 0)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Under 18 Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>{LABELS.UNDER_18}</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{LABELS.GROUP}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.PERSON_COUNT}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.PERFORMANCE_COUNT}</th>
            </tr>
          </thead>
          <tbody>
            {under18Data.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={3}>{LABELS.NO_DATA}</td>
              </tr>
            ) : (
              <>
                {under18Data.map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{row.session}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.personCount}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.performanceCount}</td>
                  </tr>
                ))}
                <tr style={styles.trTotal}>
                  <td style={{ ...styles.td, ...styles.tdTotal }}>{LABELS.TOTAL}</td>
                  <td style={{ ...styles.td, ...styles.tdNumber, ...styles.tdTotal }}>
                    {under18Data.reduce((sum, row) => sum + row.personCount, 0)}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdNumber, ...styles.tdTotal }}>
                    {under18Data.reduce((sum, row) => sum + row.performanceCount, 0)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Coaches Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>{LABELS.COACHES}</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{LABELS.COACH_NAME}</th>
              <th style={styles.th}>{LABELS.COACH_GROUPS}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.COACH_EXPERIENCE}</th>
              <th style={{ ...styles.th, ...styles.thNumber }}>{LABELS.COACH_HOURS}</th>
            </tr>
          </thead>
          <tbody>
            {coachData.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={4}>{LABELS.NO_DATA}</td>
              </tr>
            ) : (
              <>
                {coachData.map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{row.name}</td>
                    <td style={styles.td}>{row.sessions}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.experience > 0 ? row.experience : '-'}</td>
                    <td style={{ ...styles.td, ...styles.tdNumber }}>{row.hours}</td>
                  </tr>
                ))}
                <tr style={styles.trTotal}>
                  <td style={{ ...styles.td, ...styles.tdTotal }}>{LABELS.TOTAL}</td>
                  <td style={{ ...styles.td, ...styles.tdTotal }}></td>
                  <td style={{ ...styles.td, ...styles.tdTotal }}></td>
                  <td style={{ ...styles.td, ...styles.tdNumber, ...styles.tdTotal }}>
                    {coachData.reduce((sum, row) => sum + row.hours, 0)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '16px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.1rem',
    color: '#ffffff',
    margin: 0,
  },
  refreshButton: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: 'rgba(102, 126, 234, 0.15)',
    color: '#667eea',
    border: '1px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#a0a0b0',
    marginBottom: '12px',
    borderBottom: '1px solid #2a2a3e',
    paddingBottom: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    fontWeight: 600,
    borderBottom: '2px solid #2a2a3e',
  },
  thNumber: {
    textAlign: 'right',
    width: '100px',
  },
  td: {
    padding: '10px 12px',
    color: '#e0e0e0',
    borderBottom: '1px solid #2a2a3e',
  },
  tdNumber: {
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  trEven: {
    background: 'rgba(26, 26, 46, 0.3)',
  },
  trOdd: {
    background: 'rgba(26, 26, 46, 0.6)',
  },
  trTotal: {
    background: 'rgba(102, 126, 234, 0.15)',
  },
  tdTotal: {
    fontWeight: 600,
    color: '#667eea',
    borderTop: '2px solid #667eea',
  },
};

export default PerformanceReport;
