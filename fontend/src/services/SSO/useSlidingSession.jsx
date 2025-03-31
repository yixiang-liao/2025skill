import { useEffect, useRef } from 'react';
import { silentLogin } from './auth';

export const useSlidingSession = () => {
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await silentLogin();
        resetTimer();
      } catch {}
    }, 3 * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timer.current);
    };
  }, []);
};