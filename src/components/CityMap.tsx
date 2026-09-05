import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polygon, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { FleetBus, UrbanEvent } from '../types';
import { CORRIDOR_ROUTE, MONITORED_AREAS } from '../config/monitoredCorridor';

const colors = { critical:'#ff526a', high:'#ff9d42', medium:'#f6cf56', low:'#3bd7c5' };
const zoneColors = ['#14c7bd','#ef8d39','#e8ae24','#37b879','#3588da','#8358d3','#c55375'];

export function CityMap({ events, buses, onSelect, compact = false }: { events: UrbanEvent[]; buses: FleetBus[]; onSelect:(event:UrbanEvent)=>void; compact?:boolean }) {
  const [layers, setLayers] = useState({ events:true, buses:true, zones:true });
  const bounds = useMemo(() => MONITORED_AREAS.flatMap((area) => area.boundary) as [number,number][], []);
  return <div className={'city-map '+(compact ? 'compact' : '')}>
    <MapContainer bounds={bounds} boundsOptions={{padding:[20,20]}} maxBounds={[[28.61,77.08],[28.80,77.29]]} minZoom={11} scrollWheelZoom className="corridor-map">
      <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {layers.zones && <><Polyline positions={CORRIDOR_ROUTE} pathOptions={{color:'#f2cf43',weight:4,dashArray:'8 8',opacity:.95}} />
        {MONITORED_AREAS.map((area,index) => <Polygon key={area.name} positions={area.boundary} pathOptions={{color:zoneColors[index],weight:2,fillColor:zoneColors[index],fillOpacity:.43,dashArray:'5 5'}}>
          <Tooltip permanent direction="center" className="zone-label">{area.name}</Tooltip>
        </Polygon>)}
      </>}
      {layers.buses && buses.map((bus) => <CircleMarker key={bus.id} center={[bus.lat,bus.lng]} radius={7} pathOptions={{color:'#e8ffff',weight:2,fillColor:'#36c7cf',fillOpacity:1}}><Popup><b>{bus.id}</b><br/>{bus.route}<br/>{bus.speed} km/h</Popup><Tooltip>{bus.id}</Tooltip></CircleMarker>)}
      {layers.events && events.map((event) => <CircleMarker key={event.id} center={[event.lat,event.lng]} radius={event.severity==='critical'?11:9} pathOptions={{color:'#fff',weight:2,fillColor:colors[event.severity],fillOpacity:1}} eventHandlers={{click:()=>onSelect(event)}}><Popup><b>{event.type}</b><br/>{event.location}<br/>Confidence: {event.confidence}%</Popup></CircleMarker>)}
    </MapContainer>
    <div className="layer-switch"><button className="layers"><Layers size={15}/> Layers</button><div className="layer-menu"><label><input type="checkbox" checked={layers.zones} onChange={(event)=>setLayers((current)=>({...current,zones:event.target.checked}))}/> Corridor zones</label><label><input type="checkbox" checked={layers.buses} onChange={(event)=>setLayers((current)=>({...current,buses:event.target.checked}))}/> Active buses</label><label><input type="checkbox" checked={layers.events} onChange={(event)=>setLayers((current)=>({...current,events:event.target.checked}))}/> AI alerts</label></div></div>
    <div className="map-legend"><b>MAP LEGEND</b><span><i className="dot bus-dot"/> Active buses</span><span><i className="dot"/> AI alerts</span><span><i className="line-dot"/> Monitored corridor</span><span><i className="zone-dot"/> Corridor zones</span></div>
  </div>;
}
