import { useEffect, useRef, useState } from 'react';
import type { LiveBus } from '../types';
import { fetchLiveBuses } from '../services/liveBusApi';

const POLL_INTERVAL_MS = 10_000;
export interface LiveBusState { buses: LiveBus[] | null; loading: boolean; error: string | null; isLive: boolean; }
export function useLiveBuses(enabled = true): LiveBusState {
  const [buses, setBuses] = useState<LiveBus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const polling = useRef(false);
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    let active = true; const controller = new AbortController();
    const refresh = async () => { if (polling.current) return; polling.current = true; try { const result = await fetchLiveBuses(controller.signal); if (active) { setBuses(result.buses); setError(null); } } catch (reason) { if (active && !(reason instanceof DOMException && reason.name === 'AbortError')) setError(reason instanceof Error ? reason.message : 'Live bus data unavailable'); } finally { polling.current = false; if (active) setLoading(false); } };
    void refresh(); const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => { active = false; controller.abort(); window.clearInterval(interval); };
  }, [enabled]);
  return { buses, loading, error, isLive: buses !== null };
}
