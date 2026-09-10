import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EventPanel } from './components/EventPanel';
import { useUrbanData } from './hooks/useUrbanData';
import { useLiveBuses } from './hooks/useLiveBuses';
import { Overview, MapPage, Listing, Placeholder } from './pages';

export function App() {
  const { data, error, refresh, action, simulate } = useUrbanData();
  const liveBuses = useLiveBuses();
  const [selected, setSelected] = useState<string>();
  const [menu, setMenu] = useState(false);
  if (error) return <main className="error"><h1>Could not reach the intelligence feed.</h1><button onClick={refresh}>Retry connection</button></main>;
  if (!data) return <main className="loading"><div className="loader"/><p>Connecting to UrbanLens command stream…</p></main>;
  const select = (id: string) => setSelected(id);
  const event = data.events.find((item) => item.id === selected);
  return <div className="app">
    <div className={menu ? 'mobile-side open' : 'mobile-side'} onClick={() => setMenu(false)}><Sidebar/></div>
    <div className="desktop-side"><Sidebar/></div>
    <main className="shell"><Header onMenu={() => setMenu(true)}/><div className="content"><Routes>
      <Route path="/" element={<Overview data={data} liveBuses={liveBuses} onSelect={(item) => select(item.id)} onSimulate={simulate}/>}/>
      <Route path="/map" element={<MapPage data={data} liveBuses={liveBuses} onSelect={(item) => select(item.id)}/>}/>
      <Route path="/fleet" element={<Listing title="Fleet operations" description="Live health and edge-node intelligence across the deployed fleet." data={data} onSelect={(item) => select(item.id)}/>}/>
      <Route path="/traffic" element={<Listing title="Traffic intelligence" description="AI-derived vehicle density, bottlenecks and route delay signals." data={data} onSelect={(item) => select(item.id)} filter={(item) => item.type === 'Traffic congestion'}/>}/>
      <Route path="/road-conditions" element={<Listing title="Road conditions" description="Prioritized defects reported by front-facing fleet cameras." data={data} onSelect={(item) => select(item.id)} filter={(item) => item.type === 'Pothole' || item.type === 'Waterlogging'}/>}/>
      <Route path="/incidents" element={<Listing title="Incident center" description="Incident detection, vehicle tracking and evidence review." data={data} onSelect={(item) => select(item.id)} filter={(item) => item.type === 'Rash driving'}/>}/>
      <Route path="/pedestrians" element={<Listing title="Pedestrian safety" description="Vulnerable road-user observations from side and front cameras." data={data} onSelect={(item) => select(item.id)} filter={(item) => item.type === 'Pedestrian safety'}/>}/>
      {['infrastructure','routes','reports','ai-monitoring','settings'].map((path) => <Route key={path} path={'/'+path} element={<Placeholder title={path.replace(/-/g,' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}/>}/>)}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes></div></main>
    {event && <EventPanel event={event} onClose={() => setSelected(undefined)} onAction={async (id, status) => { await action(id, status); setSelected(undefined); }}/>}
  </div>;
}
