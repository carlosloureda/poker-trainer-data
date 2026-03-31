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
  renameStrategy: (name: string, newName: string) => Promise<void>;
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

  // Helper logic to find what to load
  const autoLoad = async (list: Strategy[]) => {
    if (list.length === 0) return;
    
    const last = localStorage.getItem('last_strategy');
    const toLoad = (last && list.find(s => s.name === last)) ? last : list[0].name;
    
    // We can't call loadStrategy directly here as it uses state we are setting
    try {
      const json = await apiGetStrategy(toLoad) as RangeCraftJSON;
      setPositions(parseRangeCraftJSON(json));
      setLoadedStrategy(toLoad);
      localStorage.setItem('last_strategy', toLoad);
    } catch (e) {
      console.error("Auto-load failed", e);
    }
  };

  // On mount, check if password already in sessionStorage or if we are in local dev
  useEffect(() => {
    const isDev = (import.meta as any).env.DEV;
    
    const initialize = async () => {
      try {
        const list = await apiListStrategies();
        setStrategies(list);
        
        if (isDev) {
          setAuth('ok');
          await autoLoad(list);
        } else {
          const pw = sessionStorage.getItem('site_password');
          if (pw) {
            setAuth('ok');
            await autoLoad(list);
          } else {
            setAuth('prompt');
          }
        }
      } catch (e: any) {
        if (isDev) setAuth('ok');
        else setAuth('prompt');
        setError(e.message);
      }
    };

    initialize();
  }, []);

  async function login(password: string): Promise<boolean> {
    sessionStorage.setItem('site_password', password);
    try {
      const list = await apiListStrategies();
      setStrategies(list);
      setAuth('ok');
      await autoLoad(list);
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
      localStorage.setItem('last_strategy', name);
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
    if (loadedStrategy === name) { 
      setPositions(null); 
      setLoadedStrategy(null); 
      localStorage.removeItem('last_strategy');
    }
    await refreshList();
  }

  async function importJSON(json: RangeCraftJSON, name: string) {
    await apiSaveStrategy(name, json);
    await refreshList();
    const parsed = parseRangeCraftJSON(json);
    setPositions(parsed);
    setLoadedStrategy(name);
    localStorage.setItem('last_strategy', name);
  }

  return { auth, login, strategies, loadedStrategy, positions, loadStrategy, saveStrategy, deleteStrategy, importJSON, refreshList, error };
}
