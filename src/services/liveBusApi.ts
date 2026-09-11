import type { LiveBusesResponse } from '../types';

const LIVE_BUSES_URL = 'http://localhost:8000/api/live-buses';

export async function fetchLiveBuses(signal?: AbortSignal): Promise<LiveBusesResponse> {
  const response = await fetch(LIVE_BUSES_URL, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(response.status === 503 ? 'Live bus data unavailable' : 'Live bus service unavailable');
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { buses?: unknown }).buses)) throw new Error('Invalid live bus response');
  return payload as LiveBusesResponse;
}
