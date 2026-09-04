import type { DashboardData, UrbanEvent, Status, FleetBus } from '../types';

const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let events: UrbanEvent[] = [
  {
    id: 'EVT-260905-184',
    type: 'Rash driving',
    severity: 'critical',
    status: 'new',
    confidence: 96,
    timestamp: 'Today, 10:42:18',
    busId: 'BUS-104',
    cameraId: 'FRONT-CAM',
    routeId: 'R-27',
    location: 'ITO Junction',
    lat: 28.629,
    lng: 77.241,
    summary: 'Vehicle crossed red signal at speed; plate captured.',
    plate: 'DL 3C AQ 4481',
    trackId: 'trk_8f4a',
  },
  {
    id: 'EVT-260905-183',
    type: 'Waterlogging',
    severity: 'high',
    status: 'new',
    confidence: 94,
    timestamp: 'Today, 10:37:02',
    busId: 'BUS-078',
    cameraId: 'REAR-CAM',
    routeId: 'R-18',
    location: 'Minto Road',
    lat: 28.635,
    lng: 77.225,
    summary: 'Standing water covering two lanes; route delay likely.',
  },
  {
    id: 'EVT-260905-181',
    type: 'Pothole',
    severity: 'high',
    status: 'verified',
    confidence: 92,
    timestamp: 'Today, 10:26:49',
    busId: 'BUS-116',
    cameraId: 'FRONT-CAM',
    routeId: 'R-11',
    location: 'Ring Road, Ashram',
    lat: 28.57,
    lng: 77.26,
    summary: 'Large pothole detected across left lane.',
  },
  {
    id: 'EVT-260905-179',
    type: 'Pedestrian safety',
    severity: 'medium',
    status: 'new',
    confidence: 89,
    timestamp: 'Today, 10:11:31',
    busId: 'BUS-091',
    cameraId: 'SIDE-CAM',
    routeId: 'R-42',
    location: 'Lajpat Nagar',
    lat: 28.566,
    lng: 77.243,
    summary: 'School children crossing outside marked zebra zone.',
  },
  {
    id: 'EVT-260905-174',
    type: 'Infrastructure',
    severity: 'medium',
    status: 'new',
    confidence: 88,
    timestamp: 'Today, 09:52:10',
    busId: 'BUS-053',
    cameraId: 'FRONT-CAM',
    routeId: 'R-08',
    location: 'Kashmere Gate',
    lat: 28.67,
    lng: 77.23,
    summary: 'Traffic signboard appears damaged or missing.',
  },
  {
    id: 'EVT-260905-170',
    type: 'Traffic congestion',
    severity: 'low',
    status: 'verified',
    confidence: 91,
    timestamp: 'Today, 09:44:06',
    busId: 'BUS-034',
    cameraId: 'FRONT-CAM',
    routeId: 'R-16',
    location: 'AIIMS Flyover',
    lat: 28.567,
    lng: 77.21,
    summary: 'Vehicle density elevated; estimated 11 min delay.',
  },
];

const buses: FleetBus[] = [
  {
    id: 'BUS-104',
    route: 'R-27 · Dwarka — ITO',
    status: 'online' as const,
    occupancy: 72,
    speed: 28,
    lastSeen: 'now',
    lat: 28.629,
    lng: 77.241,
  },
  {
    id: 'BUS-078',
    route: 'R-18 · Mayur Vihar — CP',
    status: 'warning' as const,
    occupancy: 84,
    speed: 12,
    lastSeen: 'now',
    lat: 28.635,
    lng: 77.225,
  },
  {
    id: 'BUS-116',
    route: 'R-11 · Badarpur — ISBT',
    status: 'online' as const,
    occupancy: 61,
    speed: 32,
    lastSeen: '20s ago',
    lat: 28.57,
    lng: 77.26,
  },
  {
    id: 'BUS-091',
    route: 'R-42 · Nehru Place — CP',
    status: 'online'as const,
    occupancy: 48,
    speed: 23,
    lastSeen: 'now',
    lat: 28.566,
    lng: 77.243,
  },
];

const traffic: DashboardData['traffic'] = [
  { time: '06:00', volume: 34, delay: 3 },
  { time: '08:00', volume: 68, delay: 9 },
  { time: '10:00', volume: 82, delay: 14 },
  { time: '12:00', volume: 56, delay: 7 },
  { time: '14:00', volume: 64, delay: 9 },
  { time: '16:00', volume: 75, delay: 12 },
  { time: '18:00', volume: 91, delay: 18 },
];

export const api = {
  async dashboard(): Promise<DashboardData> {
    await wait();

    return {
      kpis: [
        {
          label: 'Active buses',
          value: '124 / 130',
          change: '+3 this hour',
          tone: 'cyan',
        },
        {
          label: 'Online cameras',
          value: '486',
          change: '98.4% healthy',
          tone: 'green',
        },
        {
          label: 'Active alerts',
          value: String(events.filter((e) => e.status === 'new').length),
          change: '2 critical',
          tone: 'orange',
        },
        {
          label: 'Avg. route delay',
          value: '8.4 min',
          change: '−1.2 min today',
          tone: 'purple',
        },
      ],
      events: [...events],
      buses,
      traffic,
    };
  },

  async updateEvent(id: string, status: Status) {
    await wait(250);

    events = events.map((e) =>
      e.id === id ? { ...e, status } : e
    );

    return events.find((e) => e.id === id)!;
  },

  async simulate() {
    await wait(400);

    const e: UrbanEvent = {
      id: 'EVT-260905-' + Math.floor(190 + Math.random() * 9),
      type: 'Pothole',
      severity: 'medium',
      status: 'new',
      confidence: 90 + Math.floor(Math.random() * 8),
      timestamp: 'Just now',
      busId: 'BUS-104',
      cameraId: 'FRONT-CAM',
      routeId: 'R-27',
      location: 'Pragati Maidan',
      lat: 28.618,
      lng: 77.243,
      summary: 'New edge-AI detection streamed from the fleet.',
    };

    events = [e, ...events];

    return e;
  },
};

// Replace this module with HTTP calls to FastAPI;
// its method signatures are the frontend contract.
