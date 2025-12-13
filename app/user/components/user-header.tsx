import { LogOut } from "lucide-react";

interface UserHeaderProps {
  title: string;
  subtitle?: string;
}

export function UserHeader({ title, subtitle }: UserHeaderProps) {
  return (
    <div className="user-topbar">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}

