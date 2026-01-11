import { useState, useEffect, useContext, useRef } from 'react';
import logo from './logo_new_reversed_colors.png';
import './App.css';
import MainMenu from './components/MainMenu';
import RegisterTrainingSession from './components/RegisterTrainingSession';
import useSettings from './hooks/useSettings';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingContext } from './contexts/LoadingContext';
import { TABS, TAB_LABEL_TO_KEY, SESSION_OPTIONS } from './constants';
import { getCamps } from './integrations/Api';

const tabs = Object.values(TABS);

function App() {
  const { setLoading, isLoading: globalIsLoading } = useContext(LoadingContext);
  const [activeTab, setActiveTab] = useState(TABS.MAIN);
  const { settings, reloadSettings, isLoading } = useSettings();
  const prevTabRef = useRef(activeTab);

  const [trainingSessionOptions, setTrainingSessionOptions] = useState(SESSION_OPTIONS);

  const onActiveTabChange = async (tab) => {
    const mappedTab = TAB_LABEL_TO_KEY[tab] || tab;
    if (mappedTab === TABS.TRAINING_SESSION) {
      try {
        setLoading(true);
        const resp = await getCamps();
        const body = resp instanceof Response ? await resp.json() : resp;
        let data = body.data;
        const todayLocal = new Date().toLocaleDateString('en-CA');
        const labels = [];
        (Array.isArray(data) ? data : []).forEach(row => {
          const isArr = Array.isArray(row);
          if (!isArr) return;
          // Indices: [id, type, name, coach, date1, count1, date2, count2, ...]
          const campName = row[2];
          const rest = row.slice(4);
          for (let i = 0; i + 1 < rest.length; i += 2) {
            const dateStr = rest[i];
            const count = Number(rest[i + 1]) || 0;
            const parsed = new Date(dateStr);
            const parsedLocal = parsed.toLocaleDateString('en-CA');
            const isValid = !Number.isNaN(parsed.valueOf());
            if (isValid && parsedLocal === todayLocal) {
              for (let k = 1; k <= count; k++) labels.push(`${campName} SESSIO ${k}`);
            }
          }
        });
        console.log('Derived training session labels for today:', labels);
        setTrainingSessionOptions(labels.length ? labels : SESSION_OPTIONS);
      } catch (e) {
        console.error('Error prefetching camps:', e);
        setTrainingSessionOptions(SESSION_OPTIONS);
      } finally {
        setLoading(false);
      }
    }
    setActiveTab(mappedTab);
  };

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

  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo no-spin" alt="logo" />
          <h1>Oulun Kickboxing ry</h1>
          <h2>Session Registration System</h2>
        </header>
        {activeTab === TABS.MAIN && <MainMenu selected={activeTab} onSelect={onActiveTabChange} />}
        {activeTab === TABS.TRAINING_SESSION && <RegisterTrainingSession onSelect={onActiveTabChange} sessionOptions={trainingSessionOptions} />}
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
            background: 'rgba(255,255,255,0.6)',
            zIndex: 2000
          }}>
            <CircularProgress />
          </div>
        )}
      </div>
  );

}

export default App;
