import { ReactNode } from "react";

interface OrderStatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
}

export function OrderStatsCard({
  title,
  value,
  icon,
  iconBg,
}: OrderStatsCardProps) {
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

