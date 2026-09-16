export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'new' | 'verified' | 'resolved' | 'rejected';
export type EventType = 'Pothole' | 'Waterlogging' | 'Traffic congestion' | 'Accident' | 'Pedestrian safety' | 'Infrastructure';
export interface UrbanEvent {
  id:string; type:EventType; severity:Severity; status:Status; confidence:number;
  timestamp:string; busId:string; cameraId:string; routeId:string; location:string;
  lat:number; lng:number; summary:string; plate?:string; trackId?:string;
  frameUrl?: string;
  reportUrl?: string;
  rejectionReason?: string;   // NEW — mandatory reason captured when an event is rejected
}
export interface FleetBus { id:string; route:string; status:'online'|'offline'|'warning'; occupancy:number; speed:number; lastSeen:string; lat:number; lng:number; }
export interface LiveBus { bus_id:string | null; label:string | null; latitude:number; longitude:number; speed:number | null; speed_source:'feed' | 'gps-derived' | null; bearing:number | null; timestamp:string | null; zone:string | null; }
export interface LiveBusesResponse { timestamp:string; corridor:string; total_live_vehicles_received:number; corridor_buses_returned:number; buses:LiveBus[]; }
export interface DashboardData { kpis:{label:string;value:string;change:string;tone:string}[]; events:UrbanEvent[]; buses:FleetBus[]; traffic:{time:string;volume:number;delay:number}[]; }
