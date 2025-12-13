import { ReactNode } from "react";

interface ReportStatsCardProps {
  title: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  icon: ReactNode;
  iconBg: string;
}

export function ReportStatsCard({
  title,
  value,
  trend,
  trendPositive,
  icon,
  iconBg,
}: ReportStatsCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
        {trend && (
          <span className={`trend ${trendPositive ? "positive" : "negative"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

