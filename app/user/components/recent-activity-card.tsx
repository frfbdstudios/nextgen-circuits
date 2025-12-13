"use client";

import { useEffect, useState } from "react";
import { Clock, ShoppingCart, Heart } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Activity = {
  id: string;
  type: "order" | "wishlist";
  description: string;
  timestamp: string;
  icon: React.ReactNode;
};

export function RecentActivityCard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      // Fetch recent wishlist additions
      const { data: wishlistItems } = await supabase
        .from("wishlists")
        .select("id, created_at, products(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      const activityList: Activity[] = [];

      // Add orders to activity
      if (orders) {
        orders.forEach((order: { id: string; status: any; created_at: any; }) => {
          activityList.push({
            id: order.id,
            type: "order",
            description: `Order ${order.id.slice(0, 8).toUpperCase()} was ${order.status}`,
            timestamp: order.created_at,
            icon: <ShoppingCart className="text-blue-500" size={16} />,
          });
        });
      }

      // Add wishlist items to activity
      if (wishlistItems) {
        wishlistItems.forEach((item: any) => {
          activityList.push({
            id: item.id,
            type: "wishlist",
            description: `Added ${item.products.name} to wishlist`,
            timestamp: item.created_at,
            icon: <Heart className="text-red-500" size={16} />,
          });
        });
      }

      // Sort by timestamp and take top 5
      activityList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityList.slice(0, 5));
      setLoading(false);
    }

    fetchActivity();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="text-[#f39c12]" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Your latest actions</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

