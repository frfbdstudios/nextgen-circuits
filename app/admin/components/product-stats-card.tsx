import { ReactNode } from "react";

interface ProductStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendPositive: boolean;
  icon: ReactNode;
  iconBg: string;
}

export function ProductStatsCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  icon,
  iconBg,
}: ProductStatsCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {trend && (
          <span className={`trend ${trendPositive ? "positive" : "negative"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

