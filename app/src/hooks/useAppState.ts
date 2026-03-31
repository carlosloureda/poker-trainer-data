import { useState, useEffect } from 'react';
import { apiListStrategies, apiGetStrategy, apiSaveStrategy, apiDeleteStrategy } from '../api/strategies';
import type { RangeCraftJSON, ResolvedPosition } from '../core/models';
import { parseRangeCraftJSON } from '../core/rangeAdapter';

export type AuthState = 'checking' | 'prompt' | 'ok';

interface Strategy { name: string }

interface UseAppState {
  auth: AuthState;
  login: (password: string) => Promise<boolean>;
  strategies: Strategy[];
  loadedStrategy: string | null;
  positions: ResolvedPosition[] | null;
  loadStrategy: (name: string) => Promise<void>;
  saveStrategy: (name: string, json: RangeCraftJSON) => Promise<void>;
  deleteStrategy: (name: string) => Promise<void>;
  importJSON: (json: RangeCraftJSON, name: string) => Promise<void>;
  refreshList: () => Promise<void>;
  error: string | null;
}

export function useAppState(): UseAppState {
  const [auth, setAuth] = useState<AuthState>('checking');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadedStrategy, setLoadedStrategy] = useState<string | null>(null);
  const [positions, setPositions] = useState<ResolvedPosition[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if password already in sessionStorage or if we are in local dev
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost';
    if (isLocal) {
      apiListStrategies()
        .then((list) => { setStrategies(list); setAuth('ok'); })
        .catch((e) => { setError(`Error connecting to local API: ${e.message}`); setAuth('prompt'); });
      return;
    }

    const pw = sessionStorage.getItem('site_password');
    if (pw) {
      apiListStrategies()
        .then((list) => { setStrategies(list); setAuth('ok'); })
        .catch((e) => {
          if (e.message === 'UNAUTHORIZED') { sessionStorage.removeItem('site_password'); setAuth('prompt'); }
          else { setAuth('prompt'); }
        });
    } else {
      setAuth('prompt');
    }
  }, []);

  async function login(password: string): Promise<boolean> {
    sessionStorage.setItem('site_password', password);
    try {
      const list = await apiListStrategies();
      setStrategies(list);
      setAuth('ok');
      return true;
    } catch {
      sessionStorage.removeItem('site_password');
      return false;
    }
  }

  async function refreshList() {
    try {
      const list = await apiListStrategies();
      setStrategies(list);
    } catch (e) {
      setError(String(e));
    }
  }

  async function loadStrategy(name: string) {
    try {
      const json = await apiGetStrategy(name) as RangeCraftJSON;
      setPositions(parseRangeCraftJSON(json));
      setLoadedStrategy(name);
      setError(null);
    } catch (e) {
      setError(`Error al cargar "${name}": ${e}`);
    }
  }

  async function saveStrategy(name: string, json: RangeCraftJSON) {
    await apiSaveStrategy(name, json);
    await refreshList();
  }

  async function deleteStrategy(name: string) {
    await apiDeleteStrategy(name);
    if (loadedStrategy === name) { setPositions(null); setLoadedStrategy(null); }
    await refreshList();
  }

  async function importJSON(json: RangeCraftJSON, name: string) {
    await apiSaveStrategy(name, json);
    await refreshList();
    const parsed = parseRangeCraftJSON(json);
    setPositions(parsed);
    setLoadedStrategy(name);
  }

  return { auth, login, strategies, loadedStrategy, positions, loadStrategy, saveStrategy, deleteStrategy, importJSON, refreshList, error };
}
