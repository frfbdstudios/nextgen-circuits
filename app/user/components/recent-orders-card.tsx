"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-green-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-indigo-500" },
  delivered: { label: "Delivered", color: "bg-green-600" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  refunded: { label: "Refunded", color: "bg-gray-500" },
};

export function RecentOrdersCard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("id, status, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  const formatOrderId = (id: string) => {
    return `#${id.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="text-[#3498db]" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500">Your latest orders</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-500 mb-3">No orders yet</p>
            <Link href="/products">
              <button className="px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-sm font-medium transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status] || {
                label: order.status,
                color: "bg-gray-500",
              };
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium font-mono text-sm text-gray-900">
                      {formatOrderId(order.id)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-semibold text-[#00ccff]">
                      {formatCurrency(Number(order.total))}
                    </div>
                    <Badge className={`${status.color} text-white text-xs`}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <Link href="/user/orders">
          <button className="w-full px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-sm font-medium transition-colors">
            View All Orders
          </button>
        </Link>
      </div>
    </div>
  );
}

