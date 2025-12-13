import { FileText, MessageSquare, Eye, Clock, Plus } from "lucide-react";
import { ContentStatsCard } from "./components/content-stats-card";
import { ContentTable } from "./components/content-table";
import { ContentSearchFilters } from "./components/content-search-filters";
import { AdminHeader } from "../components/admin-header";

export default function ContentPage() {
  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your website content</p>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <button className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Content</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <ContentStatsCard
            title="Total Posts"
            value="24"
            icon={<FileText size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <ContentStatsCard
            title="Comments"
            value="156"
            icon={<MessageSquare size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
          <ContentStatsCard
            title="Total Views"
            value="12.5K"
            icon={<Eye size={24} className="text-[#9333ea]" />}
            iconBg="bg-purple-100"
          />
          <ContentStatsCard
            title="Draft Posts"
            value="5"
            icon={<Clock size={24} className="text-[#f39c12]" />}
            iconBg="bg-orange-100"
          />
        </div>

        {/* Search and Filters */}
        <ContentSearchFilters />

        {/* Content Table */}
        <ContentTable />
      </div>
    </>
  );
}

