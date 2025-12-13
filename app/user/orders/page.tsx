import { ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { OrderSummaryCard } from "./components/order-summary-card";
import { OrderFilters } from "./components/order-filters";
import { OrdersTable } from "./components/orders-table";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getOrderStats() {
  const supabase = await getServerSupabaseClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get all orders for the user
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status")
    .eq("user_id", user.id);

  if (!orders) {
    return {
      total: 0,
      confirmed: 0,
      pending: 0,
    };
  }

  const total = orders.length;
  const confirmed = orders.filter((o: { status: string; }) => o.status === "confirmed").length;
  const pending = orders.filter((o: { status: string; }) => o.status === "pending").length;

  return {
    total,
    confirmed,
    pending,
  };
}

export default async function MyOrdersPage() {
  const stats = await getOrderStats();

  return (
    <>
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
      
      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <OrderSummaryCard
          title="Total Orders"
          value={stats.total.toString()}
          icon={<ShoppingCart size={24} className="text-[#3498db]" />}
          iconBg="bg-blue-100"
        />
        <OrderSummaryCard
          title="Confirmed"
          value={stats.confirmed.toString()}
          icon={<CheckCircle size={24} className="text-[#2ecc71]" />}
          iconBg="bg-green-100"
        />
        <OrderSummaryCard
          title="Pending"
          value={stats.pending.toString()}
          icon={<Clock size={24} className="text-[#f39c12]" />}
          iconBg="bg-orange-100"
        />
      </div>

      {/* Orders Table with built-in filters */}
      <OrdersTable />
    </>
  );
}

