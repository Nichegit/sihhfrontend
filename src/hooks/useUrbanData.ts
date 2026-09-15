import { useEffect, useState } from 'react';
import { api } from '../services/mockApi';
import { runDemoWithVideo, toUrbanEvent } from '../services/runDemoApi';
import type { DashboardData, Status } from '../types';

export function useUrbanData() {
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  const refresh = () => api.dashboard().then(setData).catch(() => setError(true));

  useEffect(() => {
    refresh();
  }, []);

  const action = async (id: string, status: Status, reason?: string) => {   // NEW — reason passed through for rejects
    await api.updateEvent(id, status, reason);
    refresh();
  };

  // Real pipeline run: uploads a video to run.py's /api/run-demo, waits for
  // init.py -> extract_frames.py -> detect_hazard.py to finish, then merges
  // the real detected events on top of the existing (fake) dashboard data.
  const runDemo = async (file: File) => {
    setSimulating(true);
    setSimulateError(null);
    try {
      const result = await runDemoWithVideo(file);
      const liveEvents = result.events.map((event) => toUrbanEvent(event, result.report_url));
      setData((current) => current ? { ...current, events: [...liveEvents, ...current.events] } : current);
    } catch (reason) {
      setSimulateError(reason instanceof Error ? reason.message : 'Run demo failed');
    } finally {
      setSimulating(false);
    }
  };

  return { data, error, refresh, action, runDemo, simulating, simulateError };
}