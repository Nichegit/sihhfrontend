import { Bell,ChevronDown,Menu } from 'lucide-react';
import { CORRIDOR_LABEL } from '../config/monitoredCorridor';
export function Header({onMenu}:{onMenu:()=>void}){return <header><button className="icon mobile" onClick={onMenu}><Menu size={20}/></button><div className="crumb"><b>MONITORED CORRIDOR</b><span>·</span>{CORRIDOR_LABEL}</div><div className="header-actions"><div className="avatar">AS</div><ChevronDown size={15}/></div></header>}
