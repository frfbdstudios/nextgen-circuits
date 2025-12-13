import { Box, AlertTriangle, XCircle, CheckCircle, Plus } from "lucide-react";
import { InventoryStatsCard } from "./components/inventory-stats-card";
import { InventoryTable } from "./components/inventory-table";
import { InventorySearchFilters } from "./components/inventory-search-filters";
import { AdminHeader } from "../components/admin-header";

export default function InventoryPage() {
  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage your stock levels</p>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <button className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">Adjust Stock</span>
              <span className="sm:hidden">Adjust</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <InventoryStatsCard
            title="Total Items"
            value="2"
            icon={<Box size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <InventoryStatsCard
            title="Low Stock Items"
            value="1"
            icon={<AlertTriangle size={24} className="text-[#f39c12]" />}
            iconBg="bg-yellow-100"
          />
          <InventoryStatsCard
            title="Out of Stock"
            value="0"
            icon={<XCircle size={24} className="text-[#e74c3c]" />}
            iconBg="bg-red-100"
          />
          <InventoryStatsCard
            title="Healthy Stock"
            value="1"
            icon={<CheckCircle size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
        </div>

        {/* Search and Filters */}
        <InventorySearchFilters />

        {/* Inventory Table */}
        <InventoryTable />
      </div>
    </>
  );
}

