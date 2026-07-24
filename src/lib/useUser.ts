import { useState, useEffect } from 'react';

type AppMode = 'evaluating' | 'no_contact';

export function useUser() {
  const [caseNo, setCaseNo] = useState<string>("00000");
  const [breakupDate, setBreakupDate] = useState<string | null>(null);
  const [punchedDates, setPunchedDates] = useState<string[]>([]);
  const [appMode, setAppModeState] = useState<AppMode>('no_contact');

  useEffect(() => {
    // Initial load
    const loadState = () => {
      let savedCaseNo = localStorage.getItem('unsent_case_no');
      if (!savedCaseNo) {
        savedCaseNo = Math.floor(10000 + Math.random() * 90000).toString();
        localStorage.setItem('unsent_case_no', savedCaseNo);
      }
      setCaseNo(savedCaseNo);

      let savedDate = localStorage.getItem('unsent_breakup_date');
      if (!savedDate) {
        savedDate = new Date().toISOString();
        localStorage.setItem('unsent_breakup_date', savedDate);
      }
      setBreakupDate(savedDate);

      const savedPunches = localStorage.getItem('unsent_punched_dates');
      if (savedPunches) {
        setPunchedDates(JSON.parse(savedPunches));
      }

      const savedMode = localStorage.getItem('unsent_app_mode') as AppMode;
      if (savedMode) {
        setAppModeState(savedMode);
      }
    };
    
    loadState();

    // Listen for custom event to sync state across hook instances
    const handleSync = () => loadState();
    window.addEventListener('unsent_sync', handleSync);
    
    return () => {
      window.removeEventListener('unsent_sync', handleSync);
    };
  }, []);

  const streakDays = breakupDate 
    ? Math.floor((new Date().getTime() - new Date(breakupDate).getTime()) / (1000 * 3600 * 24))
    : 0;

  const punchToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!punchedDates.includes(todayStr)) {
      const newPunches = [...punchedDates, todayStr];
      setPunchedDates(newPunches);
      localStorage.setItem('unsent_punched_dates', JSON.stringify(newPunches));
      window.dispatchEvent(new Event('unsent_sync'));
    }
  };

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    localStorage.setItem('unsent_app_mode', mode);
    window.dispatchEvent(new Event('unsent_sync'));
  };

  return { caseNo, streakDays, breakupDate, punchedDates, punchToday, appMode, setAppMode };
}
