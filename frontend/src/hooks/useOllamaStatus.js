import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api.js';

const POLL_INTERVAL_MS = 30_000;

export function useOllamaStatus() {
  const [ollamaStatus, setOllamaStatus] = useState('checking');

  const check = useCallback(() => {
    checkHealth()
      .then(data => setOllamaStatus(data.ollama === 'running' ? 'running' : 'unreachable'))
      .catch(() => setOllamaStatus('unreachable'));
  }, []);

  useEffect(() => {
    check();

    const interval = setInterval(check, POLL_INTERVAL_MS);

    function onFocus() { check(); }
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') check();
    }

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [check]);

  return ollamaStatus;
}
