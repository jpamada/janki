import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { format } from 'date-fns';

function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(getTodayKey);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackgrounded = appState.current.match(/inactive|background/);
      appState.current = nextState;

      if (wasBackgrounded && nextState === 'active') {
        const freshKey = getTodayKey();
        setTodayKey((current) => (current === freshKey ? current : freshKey));
      }
    });

    return () => subscription.remove();
  }, []);

  return todayKey;
}