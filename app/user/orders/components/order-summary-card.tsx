import { ReactNode } from "react";

interface OrderSummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
}

export function OrderSummaryCard({
  title,
  value,
  icon,
  iconBg,
}: OrderSummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center gap-4">
      <div className={`${iconBg} rounded-lg p-3 flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

