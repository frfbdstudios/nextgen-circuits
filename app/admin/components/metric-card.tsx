import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: ReactNode;
  iconBg: string;
}

export function MetricCard({ title, value, trend, icon, iconBg }: MetricCardProps) {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="size-4" />
              <span>{trend}</span>
            </div>
          </div>
          <div className={`${iconBg} rounded-full p-3 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

