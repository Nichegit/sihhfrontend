import type { DashboardData, FleetBus, Status, UrbanEvent } from '../types';
import { getMonitoredArea, isWithinMonitoredCorridor, type MonitoredAreaName } from '../config/monitoredCorridor';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const point = (areaName: MonitoredAreaName, latOffset = 0, lngOffset = 0) => {
  const area = getMonitoredArea(areaName); const lat = area.center[0] + latOffset; const lng = area.center[1] + lngOffset;
  if (!isWithinMonitoredCorridor(lat, lng)) throw new Error(`Mock point is outside monitored corridor: ${areaName}`);
  return { location: area.name, lat, lng };
};

let events: UrbanEvent[] = [
  { id:'EVT-260905-184', type:'Rash driving', severity:'critical', status:'new', confidence:96, timestamp:'Today, 10:42:18', busId:'BUS-104', cameraId:'FRONT-CAM', routeId:'R-01', ...point('Chandni Chowk',0.001,-0.002), summary:'Vehicle crossed a signal inside the monitored zone; plate captured.', plate:'DL 3C AQ 4481', trackId:'trk_8f4a' },
  { id:'EVT-260905-183', type:'Waterlogging', severity:'high', status:'new', confidence:94, timestamp:'Today, 10:37:02', busId:'BUS-078', cameraId:'REAR-CAM', routeId:'R-02', ...point('Sadar Bazar',-0.002,0.002), summary:'Standing water covers one lane inside the monitored corridor.' },
  { id:'EVT-260905-181', type:'Pothole', severity:'high', status:'verified', confidence:92, timestamp:'Today, 10:26:49', busId:'BUS-116', cameraId:'FRONT-CAM', routeId:'R-03', ...point('Azadpur',0.002,0.001), summary:'Large pothole detected near the corridor route.' },
  { id:'EVT-260905-179', type:'Pedestrian safety', severity:'medium', status:'new', confidence:89, timestamp:'Today, 10:11:31', busId:'BUS-091', cameraId:'SIDE-CAM', routeId:'R-04', ...point('Kamla Nagar',-0.002,-0.002), summary:'Pedestrian crossing risk identified near a busy corridor approach.' },
  { id:'EVT-260905-174', type:'Infrastructure', severity:'medium', status:'new', confidence:88, timestamp:'Today, 09:52:10', busId:'BUS-053', cameraId:'FRONT-CAM', routeId:'R-05', ...point('Jahangirpuri',0.002,0.001), summary:'Traffic signboard appears damaged within the monitored zone.' },
  { id:'EVT-260905-170', type:'Traffic congestion', severity:'low', status:'verified', confidence:91, timestamp:'Today, 09:44:06', busId:'BUS-034', cameraId:'FRONT-CAM', routeId:'R-06', ...point('Badli',-0.002,0.001), summary:'Vehicle density is elevated; corridor delay estimate updated.' },
];

const buses: FleetBus[] = [
  { id:'BUS-104', route:'R-01 · Old Delhi → Azadpur', status:'online', occupancy:72, speed:28, lastSeen:'now', ...point('Chandni Chowk',0.001,0.001) },
  { id:'BUS-078', route:'R-02 · Sadar Bazar → Jahangirpuri', status:'warning', occupancy:84, speed:12, lastSeen:'now', ...point('Sadar Bazar',0.001,-0.002) },
  { id:'BUS-116', route:'R-03 · Kamla Nagar → Badli', status:'online', occupancy:61, speed:32, lastSeen:'20s ago', ...point('Azadpur',-0.002,-0.001) },
  { id:'BUS-091', route:'R-04 · Azadpur → Chandni Chowk', status:'online', occupancy:48, speed:23, lastSeen:'now', ...point('Jahangirpuri',-0.001,0.001) },
  { id:'BUS-053', route:'R-05 · Old Delhi → Badli', status:'online', occupancy:54, speed:26, lastSeen:'now', ...point('Badli',0.001,-0.002) },
];

const traffic: DashboardData['traffic'] = [
  ['Old Delhi',34,3],['Chandni Chowk',68,9],['Sadar Bazar',82,14],['Kamla Nagar',56,7],['Azadpur',64,9],['Jahangirpuri',75,12],['Badli',91,18],
].map(([time,volume,delay]) => ({ time: String(time), volume: Number(volume), delay: Number(delay) }));

export const api = {
  async dashboard(): Promise<DashboardData> { await wait(); return { kpis:[
    {label:'Active buses',value:'124 / 130',change:'+3 this hour',tone:'cyan'}, {label:'Online cameras',value:'486',change:'98.4% healthy',tone:'green'},
    {label:'Active alerts',value:String(events.filter((event) => event.status === 'new').length),change:'2 critical',tone:'orange'}, {label:'Avg. route delay',value:'8.4 min',change:'−1.2 min today',tone:'purple'},
  ], events: events.filter((event) => isWithinMonitoredCorridor(event.lat, event.lng)), buses: buses.filter((bus) => isWithinMonitoredCorridor(bus.lat, bus.lng)), traffic }; },
  async updateEvent(id: string, status: Status) { await wait(250); events = events.map((event) => event.id === id ? {...event,status} : event); return events.find((event) => event.id === id)!; },
  async simulate() { await wait(400); const simulatedPoint = point('Old Delhi', -0.001, -0.001); const event: UrbanEvent = { id:`EVT-260905-${Math.floor(190 + Math.random() * 9)}`, type:'Pothole', severity:'medium', status:'new', confidence:90 + Math.floor(Math.random() * 8), timestamp:'Just now', busId:'BUS-104', cameraId:'FRONT-CAM', routeId:'R-01', ...simulatedPoint, summary:'New edge-AI pothole detection inside the monitored corridor.' }; events=[event,...events]; return event; },
};
