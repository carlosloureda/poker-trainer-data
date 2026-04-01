import { useState, useEffect } from 'react';
import { apiListStrategies, apiGetStrategy, apiSaveStrategy, apiDeleteStrategy, apiRenameStrategy } from '../api/strategies';
import type { RangeCraftJSON, ResolvedPosition } from '../core/models';
import { parseRangeCraftJSON, unparseRangeCraftJSON } from '../core/rangeAdapter';

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
  createStrategy: (name: string) => Promise<void>;
  updateStrategy: (name: string, positions: ResolvedPosition[]) => Promise<void>;
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

  async function renameStrategy(name: string, newName: string) {
    try {
      await apiRenameStrategy(name, newName);
      if (loadedStrategy === name) {
        setLoadedStrategy(newName);
        localStorage.setItem('last_strategy', newName);
      }
      await refreshList();
    } catch (e) {
      setError(`Error al renombrar: ${e}`);
    }
  }

  async function createStrategy(name: string) {
    const emptyJson: RangeCraftJSON = {
      Range_Craft: {
        utg: { open: [] },
        hj: {}, co: {}, btn: {}, sb: {}, bb: {}
      }
    };
    await apiSaveStrategy(name, emptyJson);
    await refreshList();
    await loadStrategy(name);
  }

  async function updateStrategy(name: string, updatedPositions: ResolvedPosition[]) {
    try {
      const json = unparseRangeCraftJSON(updatedPositions);
      await apiSaveStrategy(name, json);
      // We don't necessarily need to reload everything, but let's refresh positions state
      setPositions([...updatedPositions]); 
    } catch (e) {
      setError(`Error al guardar: ${e}`);
    }
  }

  return { auth, login, strategies, loadedStrategy, positions, loadStrategy, saveStrategy, createStrategy, updateStrategy, renameStrategy, deleteStrategy, importJSON, refreshList, error };
}
