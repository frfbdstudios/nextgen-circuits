"use client";

import { ShoppingCart, DollarSign, Truck, CheckCircle, RefreshCw } from "lucide-react";
import { OrderStatsCard } from "./components/order-stats-card";
import { OrderTable } from "./components/order-table";
import { OrderSearchFilters } from "./components/order-search-filters";
import { AdminHeader } from "../components/admin-header";
import { useState, useEffect } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function OrdersPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingShipments: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all-time");

  const supabase = getBrowserSupabaseClient();

  const fetchStats = async () => {
    try {
      setRefreshing(true);

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("status, total");

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const revenue = orders?.reduce((sum: number, order: { total: any; }) => sum + Number(order.total), 0) || 0;
      const pendingShipments = orders?.filter(
        (        order: { status: string; }) => order.status === 'confirmed' || order.status === 'processing'
      ).length || 0;
      const completedOrders = orders?.filter(
        (        order: { status: string; }) => order.status === 'delivered'
      ).length || 0;

      setStats({
        totalOrders,
        revenue,
        pendingShipments,
        completedOrders,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
    setRefreshKey(prev => prev + 1); // Trigger OrderTable refresh
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage customer orders</p>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh Data"}</span>
              <span className="sm:hidden">{refreshing ? "..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <OrderStatsCard
            title="Total Orders"
            value={loading ? "..." : stats.totalOrders.toString()}
            icon={<ShoppingCart size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <OrderStatsCard
            title="Revenue"
            value={loading ? "..." : formatCurrency(stats.revenue)}
            icon={<DollarSign size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
          <OrderStatsCard
            title="Pending Shipments"
            value={loading ? "..." : stats.pendingShipments.toString()}
            icon={<Truck size={24} className="text-[#e74c3c]" />}
            iconBg="bg-red-100"
          />
          <OrderStatsCard
            title="Completed Orders"
            value={loading ? "..." : stats.completedOrders.toString()}
            icon={<CheckCircle size={24} className="text-[#9333ea]" />}
            iconBg="bg-purple-100"
          />
        </div>

        {/* Search and Filters */}
        <OrderSearchFilters 
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onTimeRangeChange={setTimeRangeFilter}
        />

        {/* Order Table */}
        <OrderTable 
          key={refreshKey} 
          onOrderUpdate={fetchStats}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          timeRangeFilter={timeRangeFilter}
        />
      </div>
    </>
  );
}

