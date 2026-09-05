export type MonitoredAreaName =
  | 'Old Delhi'
  | 'Chandni Chowk'
  | 'Sadar Bazar'
  | 'Kamla Nagar'
  | 'Azadpur'
  | 'Jahangirpuri'
  | 'Badli';

export interface CorridorZone {
  name: MonitoredAreaName;
  center: [number, number];
  boundary: [number, number][];
}

// Approximate operational areas. Replace these polygons with authority-provided GIS boundaries later.
export const MONITORED_AREAS: CorridorZone[] = [
  { name: 'Old Delhi', center: [28.6562, 77.2285], boundary: [[28.648,77.217],[28.648,77.240],[28.665,77.242],[28.669,77.222]] },
  { name: 'Chandni Chowk', center: [28.6506, 77.2303], boundary: [[28.642,77.222],[28.642,77.241],[28.655,77.244],[28.660,77.226]] },
  { name: 'Sadar Bazar', center: [28.6585, 77.2057], boundary: [[28.650,77.195],[28.650,77.216],[28.668,77.219],[28.672,77.200]] },
  { name: 'Kamla Nagar', center: [28.6825, 77.2044], boundary: [[28.673,77.193],[28.673,77.216],[28.691,77.219],[28.696,77.198]] },
  { name: 'Azadpur', center: [28.7072, 77.1805], boundary: [[28.697,77.169],[28.697,77.192],[28.716,77.194],[28.721,77.174]] },
  { name: 'Jahangirpuri', center: [28.7244, 77.1630], boundary: [[28.714,77.151],[28.714,77.175],[28.733,77.178],[28.738,77.157]] },
  { name: 'Badli', center: [28.7457, 77.1385], boundary: [[28.735,77.126],[28.735,77.151],[28.754,77.154],[28.760,77.133]] },
];

export const CORRIDOR_LABEL = MONITORED_AREAS.map((area) => area.name).join(' → ');
export const CORRIDOR_ROUTE = MONITORED_AREAS.map((area) => area.center);

const toKm = (lat: number, lng: number, refLat: number): [number, number] => [lng * 111.32 * Math.cos(refLat * Math.PI / 180), lat * 110.57];
const distanceToSegmentKm = (lat: number, lng: number, start: [number, number], end: [number, number]) => {
  const refLat = (start[0] + end[0]) / 2;
  const [px, py] = toKm(lat, lng, refLat); const [ax, ay] = toKm(start[0], start[1], refLat); const [bx, by] = toKm(end[0], end[1], refLat);
  const dx = bx - ax; const dy = by - ay; const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

/** True for positions inside the connected zone corridor, with roughly 1% (~1.1 km) flexibility. */
export const isWithinMonitoredCorridor = (lat: number, lng: number) => CORRIDOR_ROUTE.slice(0, -1).some((start, index) => distanceToSegmentKm(lat, lng, start, CORRIDOR_ROUTE[index + 1]) <= 1.15);

export const getMonitoredArea = (name: MonitoredAreaName) => {
  const area = MONITORED_AREAS.find((item) => item.name === name);
  if (!area) throw new Error(`Unknown monitored area: ${name}`);
  return area;
};
