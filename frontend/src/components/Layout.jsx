import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, ArrowUpRight, Bell, ChartNoAxesCombined, ClipboardList, FilePlus2, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { label: 'Overview', to: '/', icon: Activity, end: true },
  { label: 'Report history', to: '/reports', icon: ClipboardList },
  { label: 'New report', to: '/reports/new', icon: FilePlus2 },
  { label: 'Corrective actions', to: '/actions', icon: ShieldCheck },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined },
];
const titleByPath = { '/': 'Overview', '/reports': 'Report history', '/reports/new': 'New safety report', '/actions': 'Corrective actions', '/analytics': 'Safety analytics' };

export default function Layout({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/reports/') && location.pathname !== '/reports/new';
  const title = isDetail ? 'Report analysis' : titleByPath[location.pathname] || 'Safety intelligence';
  return <div className="app-shell">
    {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup"><div className="brand-mark"><Activity size={21} strokeWidth={2.6} /></div><div><span className="brand-name">fieldnote</span><span className="brand-caption">SAFETY INTELLIGENCE</span></div><button className="icon-button close-sidebar" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-chip"><span className="workspace-dot" /><span>Demo workspace</span><span className="chip-chevron">⌄</span></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">{navigation.map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Corrective actions' && <span className="nav-count">4</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="model-card"><div className="model-icon"><ShieldCheck size={18} /></div><div><b>Prototype analysis</b><span>Rule-based fallback active</span></div><span className="online-dot" /></div><div className="side-profile"><div className="avatar">SA</div><div className="profile-copy"><b>{user?.name || 'Safety Analyst'}</b><span>{user?.role || 'HSE Analyst'}</span></div><button className="icon-button logout-button" onClick={onSignOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{title}</strong></div><div className="topbar-right"><span className="demo-pill"><span className="demo-pulse" />Synthetic Demo Data</span><button className="icon-button notification-button" title="Notifications" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">SA</div></div></header>
      <div className="page-wrap"><Outlet /></div><footer className="page-footer"><span>SIH 26165 · Safety report analysis prototype</span><span>Synthetic data only <ArrowUpRight size={12} /></span></footer></main>
  </div>;
}
