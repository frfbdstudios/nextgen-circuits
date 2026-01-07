import { DollarSign, ShoppingCart, Users, Box } from "lucide-react";
import { MetricCard } from "./components/metric-card";
import { SalesChart } from "./components/sales-chart";
import { PopularProductsChart } from "./components/popular-products-chart";
import { RecentOrdersTable } from "./components/recent-orders-table";
import { RecentActivity } from "./components/recent-activity";
import { AdminHeader } from "./components/admin-header";
import { ProfitAnalytics } from "./components/profit-analytics";
import { getServerSupabaseClient } from "@/lib/supabase/server";

async function getDashboardMetrics() {
  const supabase = await getServerSupabaseClient();

  // Get total revenue from orders (only delivered/confirmed orders)
  const { data: orders } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .in("status", ["delivered", "confirmed", "processing", "shipped"]);

  const totalRevenue = orders?.reduce((sum: number, order: { total: any; }) => sum + (Number(order.total) || 0), 0) || 0;
  const totalOrders = orders?.length || 0;

  // Get total customers (users with role 'user')
  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  // Get low stock items (threshold of 10)
  const { count: lowStockItems } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .lt("stock", 10)
    .eq("is_active", true);

  // Calculate trends (compare current month to last month)
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Current month orders
  const { data: currentMonthOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", startOfCurrentMonth.toISOString())
    .in("status", ["delivered", "confirmed", "processing", "shipped"]);

  const currentMonthRevenue = currentMonthOrders?.reduce((sum: number, order: { total: any; }) => sum + (Number(order.total) || 0), 0) || 0;
  const currentMonthOrderCount = currentMonthOrders?.length || 0;

  // Last month orders
  const { data: lastMonthOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", startOfLastMonth.toISOString())
    .lt("created_at", startOfCurrentMonth.toISOString())
    .in("status", ["delivered", "confirmed", "processing", "shipped"]);

  const lastMonthRevenue = lastMonthOrders?.reduce((sum: number, order: { total: any; }) => sum + (Number(order.total) || 0), 0) || 0;
  const lastMonthOrderCount = lastMonthOrders?.length || 0;

  // Calculate percentage trends
  const revenueTrend = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
    : currentMonthRevenue > 0 ? 100 : 0;

  const ordersTrend = lastMonthOrderCount > 0
    ? ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100)
    : currentMonthOrderCount > 0 ? 100 : 0;

  // Customer trend
  const { count: lastMonthCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .lt("created_at", startOfCurrentMonth.toISOString());

  const customersTrend = (lastMonthCustomers && lastMonthCustomers > 0)
    ? (((totalCustomers || 0) - lastMonthCustomers) / lastMonthCustomers * 100)
    : (totalCustomers || 0) > 0 ? 100 : 0;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers: totalCustomers || 0,
    lowStockItems: lowStockItems || 0,
    revenueTrend,
    ordersTrend,
    customersTrend,
  };
}

async function checkIfAdmin() {
  const supabase = await getServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role === 'admin'
}

function formatTrend(value: number): string {
  const arrow = value >= 0 ? "↑" : "↓";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% ${arrow}`;
}

function formatCurrency(value: number): string {
  return `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminDashboard() {
  const metrics = await getDashboardMetrics();
  const isAdmin = await checkIfAdmin();

  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your business performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            trend={formatTrend(metrics.revenueTrend)}
            icon={<DollarSign className="size-6 text-green-600" />}
            iconBg="bg-green-100"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders.toLocaleString()}
            trend={formatTrend(metrics.ordersTrend)}
            icon={<ShoppingCart className="size-6 text-blue-600" />}
            iconBg="bg-blue-100"
          />
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers.toLocaleString()}
            trend={formatTrend(metrics.customersTrend)}
            icon={<Users className="size-6 text-purple-600" />}
            iconBg="bg-purple-100"
          />
          <MetricCard
            title="Low Stock Items"
            value={metrics.lowStockItems.toString()}
            trend={metrics.lowStockItems > 5 ? "⚠️ Needs attention" : "✓ All good"}
            icon={<Box className="size-6 text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>

        {/* Admin-Only Profit Analytics */}
        {isAdmin && (
          <div className="grid grid-cols-1 gap-6">
            <ProfitAnalytics />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <PopularProductsChart />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersTable />
          {/* <RecentActivity /> */}
        </div>
      </div>
    </>
  );
}

