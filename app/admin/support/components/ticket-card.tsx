import { Badge } from "@/components/ui/badge";

interface TicketCardProps {
  id: string;
  title: string;
  customer: string;
  date: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
}

export function TicketCard({ id, title, customer, date, description, status }: TicketCardProps) {
  const statusColors = {
    Open: "bg-blue-500",
    "In Progress": "bg-orange-500",
    Resolved: "bg-green-500",
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">{customer}</span> • <span>{date}</span>
          </p>
          <p className="text-sm text-gray-700 mb-4">{description}</p>
        </div>
        <Badge className={`${statusColors[status]} text-white ml-4`}>
          {status}
        </Badge>
      </div>
      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
        View Details
      </button>
    </div>
  );
}

