import { useState } from 'react';
import { X,MapPin,Camera,Bus,Check,ExternalLink,FileText } from 'lucide-react';
import type { UrbanEvent,Status } from '../types';
const label=(s:string)=>s.replace(/\b\w/g,c=>c.toUpperCase());

export function EventPanel({event,onClose,onAction}:{event:UrbanEvent;onClose:()=>void;onAction:(id:string,s:Status,reason?:string)=>void}){
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);

  const reasonMissing = reason.trim().length === 0;

  const confirmReject = () => {
    if (reasonMissing) { setReasonTouched(true); return; }
    onAction(event.id, 'rejected', reason.trim());
  };

  return <section className="event-panel">
    <div className="panel-head"><div><p className="eyebrow">AI DETECTION</p><h2>{event.type}</h2></div><button className="icon" onClick={onClose}><X/></button></div>
    <div className="evidence">
      {event.frameUrl
        ? <img src={event.frameUrl} alt={`${event.type} detected frame`} />
        : <><div className="scanline"/><span>EDGE CAMERA FEED</span><b>AI</b></>}
      <p>{event.location}<br/><small>Confidence {event.confidence}% · {event.cameraId}</small></p>
    </div>
    <div className="event-meta">
      <div><label>Event ID</label><b>{event.id}</b></div>
      <div><label>Severity</label><strong className={'severity '+event.severity}>{event.severity}</strong></div>
      <div><label>Status</label><b>{label(event.status)}</b></div>
      <div><label>Detected</label><b>{event.timestamp}</b></div>
    </div>
    <div className="location"><MapPin size={16}/><span>{event.location}<small>{event.lat.toFixed(4)}, {event.lng.toFixed(4)}</small></span></div>
    <div className="source"><Bus size={16}/><span>{event.busId}<small>Route {event.routeId}</small></span><Camera size={16}/><span>{event.cameraId}<small>Edge AI stream</small></span></div>
    {event.plate&&<div className="plate">OFFENDING VEHICLE <b>{event.plate}</b><small>Track {event.trackId}</small></div>}

    <div className="panel-actions">
      <button className="button primary" onClick={()=>onAction(event.id,'resolved')}><Check size={15}/> Resolve</button>
      <button className="button reject-toggle" onClick={()=>setRejecting((current) => !current)}><X size={15}/> Reject</button>
    </div>

    {rejecting && (
      <div className="reject-box">
        <label htmlFor="reject-reason">Reason for rejection</label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(event) => { setReason(event.target.value); setReasonTouched(true); }}
          placeholder="Explain why this detection is being rejected…"
          rows={3}
        />
        {reasonTouched && reasonMissing && <small className="reject-error">A reason is required before this can be rejected.</small>}
        <div className="reject-box-actions">
          <button className="button" onClick={() => { setRejecting(false); setReason(''); setReasonTouched(false); }}>Cancel</button>
          <button className="button danger" onClick={confirmReject}>Confirm reject</button>
        </div>
      </div>
    )}

    <button className="view-map"><ExternalLink size={15}/> View full evidence & map context</button>
    {event.reportUrl &&
      <a className="report-link" href={event.reportUrl} target="_blank" rel="noreferrer">
        <FileText size={15}/> Download hazard report (PDF)
      </a>}
  </section>;
}