import type { EventType, Severity, UrbanEvent } from '../types';

export interface PipelineLocation { lat: number; lon: number; source?: string; bus_id?: string; zone?: string; }
export interface PipelineEvent {
  event_id: string; class: string; confidence: number; timestamp: string;
  location: PipelineLocation; representative_frame?: string; frame_count: number;
  frame_url?: string;   // NEW
}
export interface RunDemoResponse { events: PipelineEvent[]; plates: unknown[]; report_url?: string; }  // NEW report_url

const RUN_DEMO_URL = 'http://localhost:8001/api/run-demo';

export async function runDemoWithVideo(file: File, signal?: AbortSignal): Promise<RunDemoResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(RUN_DEMO_URL, { method: 'POST', body: formData, signal });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'Run demo failed');
  }
  return response.json();
}

const CLASS_TO_EVENT_TYPE: Record<string, EventType> = {
  Pothole: 'Pothole',
  water_logging: 'Waterlogging',
  debris: 'Infrastructure',
  garbage: 'Infrastructure',
  'garbage-overflow': 'Infrastructure',
  Accident: 'Rash driving',
  traffic_light: 'Traffic congestion',
};

export function toUrbanEvent(event: PipelineEvent, reportUrl?: string): UrbanEvent {
  const confidence = Math.round(event.confidence * 100);
  const severity: Severity = confidence >= 80 ? 'critical' : confidence >= 70 ? 'high' : confidence >= 60 ? 'medium' : 'low';
  return {
    id: event.event_id,
    type: CLASS_TO_EVENT_TYPE[event.class] ?? 'Infrastructure',
    severity,
    status: 'new',
    confidence,
    timestamp: event.timestamp,
    busId: event.location.bus_id ?? 'Unknown bus',
    cameraId: 'FRONT-CAM',
    routeId: event.location.zone ?? '-',
    location: event.location.zone ?? 'Unknown zone',
    lat: event.location.lat,
    lng: event.location.lon,
    summary: `${event.class} detected (${confidence}% confidence, ${event.frame_count} frame(s)).`,
    frameUrl: event.frame_url,   // NEW
    reportUrl,                   // NEW
  };
}