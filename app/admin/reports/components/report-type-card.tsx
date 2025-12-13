import { ReactNode } from "react";

interface ReportTypeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBg: string;
}

export function ReportTypeCard({
  title,
  description,
  icon,
  iconBg,
}: ReportTypeCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`${iconBg} rounded-lg p-4 w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

