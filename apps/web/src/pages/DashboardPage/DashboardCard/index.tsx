import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  /** Where the card's "הצג הכל" link points. */
  to: string;
  /** Extra classes for the rare card that spans two columns. */
  className?: string;
  children: ReactNode;
}

/** One dashboard card: a title, a link to the full screen, and its content. */
export default function DashboardCard({ title, to, className = '', children }: DashboardCardProps) {
  return (
    <div className={`card ${className}`.trim()}>
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        <Link to={to} className="text-xs text-forest hover:underline">
          הצג הכל
        </Link>
      </div>
      {children}
    </div>
  );
}
