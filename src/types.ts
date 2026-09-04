export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'new' | 'verified' | 'resolved' | 'rejected';
export type EventType = 'Pothole' | 'Waterlogging' | 'Traffic congestion' | 'Rash driving' | 'Pedestrian safety' | 'Infrastructure';
export interface UrbanEvent { id:string; type:EventType; severity:Severity; status:Status; confidence:number; timestamp:string; busId:string; cameraId:string; routeId:string; location:string; lat:number; lng:number; summary:string; plate?:string; trackId?:string; }
export interface FleetBus { id:string; route:string; status:'online'|'offline'|'warning'; occupancy:number; speed:number; lastSeen:string; lat:number; lng:number; }
export interface DashboardData { kpis:{label:string;value:string;change:string;tone:string}[]; events:UrbanEvent[]; buses:FleetBus[]; traffic:{time:string;volume:number;delay:number}[]; }
