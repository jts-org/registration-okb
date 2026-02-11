import { useState, useEffect, useContext, useRef } from 'react';
import logo from './logo_new_reversed_colors.png';
import './App.css';
import MainMenu from './components/MainMenu';
import RegisterCoachingSession from './components/RegisterCoachingSession';
import RegisterTrainingSession from './components/RegisterTrainingSession';
import AdminView from './components/AdminView';
import PasswordDialog from './components/PasswordDialog';
import Footer from './components/Footer';
import useSettings from './hooks/useSettings';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingContext } from './contexts/LoadingContext';
import { TABS, TAB_LABEL_TO_KEY, COACHING_SESSION_OPTIONS, SESSION_OPTIONS } from './constants';
import { getSessionsAndCamps, prefetchData } from './integrations/Api';
import { ConfigurationProvider, useAppConfig, useTranslation } from './contexts/ConfigContext';

const tabs = Object.values(TABS);

// Inner app component that uses configuration context
function AppContent() {
  const { setLoading, isLoading: globalIsLoading } = useContext(LoadingContext);
  const [activeTab, setActiveTab] = useState(TABS.MAIN);
  const { settings, reloadSettings, isLoading } = useSettings();
  const prevTabRef = useRef(activeTab);

  const [trainingSessionOptions, setTrainingSessionOptions] = useState(SESSION_OPTIONS);
  const [coachingSessionOptions, setCoachingSessionOptions] = useState([...COACHING_SESSION_OPTIONS, ...SESSION_OPTIONS]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [pendingTab, setPendingTab] = useState(null); // Track which protected tab user is trying to access
  
  // Get configuration and translations
  const config = useAppConfig();
  const t = useTranslation();

  // Helpers: local date handling and label derivation
  const toLocalYMD = (dateLike) => new Date(dateLike).toLocaleDateString('en-CA');
  const isValidDate = (d) => !Number.isNaN(d.valueOf());

  const deriveCampLabels = (data, todayLocal) => {
    const labels = [];
    (Array.isArray(data) ? data : []).forEach(row => {
      if (!Array.isArray(row)) return;
      // Row schema: [id, type, name, coach, date1, count1, date2, count2, ...]
      const campName = row[2];
      const rest = row.slice(4);
      
      // Only process valid date/count pairs (skip empty or invalid entries)
      for (let i = 0; i + 1 < rest.length; i += 2) {
        const dateStr = rest[i];
        const countVal = rest[i + 1];
        
        // Skip if date is empty/null or count is not a valid number
        if (!dateStr || dateStr === '' || dateStr === null) continue;
        
        const count = Number(countVal);
        if (!Number.isFinite(count) || count <= 0) continue;
        
        const parsed = new Date(dateStr);
        const parsedLocal = toLocalYMD(parsed);
        
        if (isValidDate(parsed) && parsedLocal === todayLocal) {
          // Only add sessions for THIS specific day that matches today
          for (let k = 1; k <= count; k++) {
            labels.push(`${campName} SESSIO ${k}`);
          }
          // Once we found today's date for this camp, don't process other dates
          break;
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
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      const start = toLocalYMD(startDate);
      const end = toLocalYMD(endDate);
      if (isValidDate(startDate) && isValidDate(endDate)) {
        if (todayLocal >= start && todayLocal <= end) labels.push(courseName);
      }
    });
    return labels;
  };

  const onActiveTabChange = async (tab) => {
    const mappedTab = TAB_LABEL_TO_KEY[tab] || tab;
    
    // Show password dialog when coach or admin tab is selected
    if (mappedTab === TABS.COACH || mappedTab === TABS.ADMIN) {
      setPendingTab(mappedTab);
      setShowPasswordDialog(true);
      setPasswordError('');
      return; // Don't change tab yet, wait for password verification
    }
    
    if (mappedTab === TABS.TRAINING_SESSION) {
      try {
        setLoading(true);
        // Fetch both camps and sessions in parallel (cached after first call)
        const { camps, sessions } = await getSessionsAndCamps();
        const todayLocal = toLocalYMD(new Date());
        
        const campLabels = deriveCampLabels(camps.data, todayLocal);
        if (campLabels.length > 0) {
          setTrainingSessionOptions([...(Array.isArray(campLabels) ? campLabels : []), ...SESSION_OPTIONS]);
        } else {
          // Use regular sessions active today
          const sessionLabels = deriveSessionLabels(sessions.data, todayLocal);
          setTrainingSessionOptions([...(Array.isArray(sessionLabels) ? sessionLabels : []), ...SESSION_OPTIONS]);
        }
      } catch (e) {
        console.error('Error deriving session options:', e);
        setTrainingSessionOptions(SESSION_OPTIONS);
      } finally {
        setLoading(false);
      }
    }
    setActiveTab(mappedTab);
  };

  // Prefetch data when app mounts for faster navigation
  useEffect(() => {
    prefetchData();
  }, []);

  // Keep global loading in sync with settings hook's loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Reload settings whenever user returns to main view; await so loading remains true
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const prev = prevTabRef.current;
        if (activeTab === TABS.MAIN && prev !== TABS.MAIN && typeof reloadSettings === 'function') {
          await reloadSettings();
        }
        prevTabRef.current = activeTab;
      } catch (error) {
        console.error('Error reloading settings:', error);
      }
    };
    if (mounted) run();
    return () => { mounted = false; };
  }, [activeTab, reloadSettings]);

  // Handle password confirmation for coach/admin access
  const handlePasswordConfirm = (enteredPassword) => {
    // Get the correct password based on pending tab
    const expectedPassword = pendingTab === TABS.ADMIN 
      ? settings?.admin?.password 
      : settings?.coach?.password;
    
    if (enteredPassword === expectedPassword) {
      setShowPasswordDialog(false);
      setPasswordError('');
      setActiveTab(pendingTab);
      setPendingTab(null);
    } else {
      setPasswordError('Väärä salasana');
      // Return to main view after a brief moment
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordError('');
        setActiveTab(TABS.MAIN);
        setPendingTab(null);
      }, 1500);
    }
  };

  // Handle password dialog cancel
  const handlePasswordCancel = () => {
    setShowPasswordDialog(false);
    setPasswordError('');
    setPendingTab(null);
    setActiveTab(TABS.MAIN);
  };

  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo no-spin" alt="logo" />
          <h1>{config.branding.clubName}</h1>
          <h2>{t('app.subtitle')}</h2>
        </header>
        {activeTab === TABS.MAIN && <MainMenu selected={activeTab} onSelect={onActiveTabChange} />}
        {activeTab === TABS.TRAINING_SESSION && <RegisterTrainingSession onSelect={onActiveTabChange} sessionOptions={trainingSessionOptions} />}
        {activeTab === TABS.COACH && <RegisterCoachingSession onSelect={onActiveTabChange} coachingSessionOptions={coachingSessionOptions} viewAsCoach={true} />}
        {activeTab === TABS.ADMIN && <AdminView onSelect={onActiveTabChange} />}
        
        {/* Password Dialog for Coach/Admin Access */}
        {showPasswordDialog && (
          <PasswordDialog
            onConfirm={handlePasswordConfirm}
            onCancel={handlePasswordCancel}
            error={passwordError}
            isAdmin={pendingTab === TABS.ADMIN}
          />
        )}
        
        {/* Optionally render content based on activeTab here */}
        {globalIsLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 15, 0.8)',
            zIndex: 2000
          }}>
            <CircularProgress />
          </div>
        )}
        
        <Footer />
      </div>
  );

}

// Main App component with ConfigurationProvider wrapper
function App() {
  return (
    <ConfigurationProvider>
      <AppContent />
    </ConfigurationProvider>
  );
}

export default App;
