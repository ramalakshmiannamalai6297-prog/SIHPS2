import { AlertCircle } from 'lucide-react';

export function RiskBadge({ value }) {
  return <span className={`risk-badge risk-${String(value || 'low').toLowerCase()}`}><span />{value || 'Low'}</span>;
}

export function StatusBadge({ value }) {
  const key = String(value || '').toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-${key}`}>{value}</span>;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function EmptyState({ icon: Icon = AlertCircle, title, detail }) {
  return <div className="empty-state"><span><Icon size={20} /></span><b>{title}</b><p>{detail}</p></div>;
}
