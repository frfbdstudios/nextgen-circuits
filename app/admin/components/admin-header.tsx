"use client";

import { Search, Bell, User, RefreshCw, Download } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function AdminHeader() {
  const { user } = useUser();
  console.log("AdminHeader user:", user);

  return (
    <div className="admin-header-wrapper">
      

      <div className="topbar-actions">
        {/* <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-count">3</span>
        </button> */}

        <div className="admin-profile">
          <div className="size-9 rounded-full bg-gray-200 flex items-center justify-center">
            <img src={user?.user_metadata?.picture} alt="Admin Avatar" className="rounded-full" />
          </div>
          <span className="admin-name text-sm font-medium text-gray-700 ml-2">{user?.user_metadata?.full_name}</span>
        </div>

      </div>
    </div>
  );
}
