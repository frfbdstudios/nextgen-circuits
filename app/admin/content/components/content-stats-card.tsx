import { ReactNode } from "react";

interface ContentStatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
}

export function ContentStatsCard({
  title,
  value,
  icon,
  iconBg,
}: ContentStatsCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

