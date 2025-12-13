import { ReactNode } from "react";

interface OrderStatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: ReactNode;
  iconBg: string;
}

export function OrderStatsCard({
  title,
  value,
  trend,
  trendPositive,
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
        <span className={`trend ${trendPositive ? "positive" : "negative"}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

