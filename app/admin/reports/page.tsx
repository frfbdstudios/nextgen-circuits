import { FileText, Download, TrendingUp, Clock, RefreshCw, Plus, BarChart3, LineChart, Box, Users, Megaphone } from "lucide-react";
import { ReportStatsCard } from "./components/report-stats-card";
import { ReportTypeCard } from "./components/report-type-card";
import { RecentReportsTable } from "./components/recent-reports-table";
import { AdminHeader } from "../components/admin-header";

export default function ReportsPage() {
  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <button className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors">
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>
            <button className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus size={16} />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid mb-6">
          <ReportStatsCard
            title="Total Reports"
            value="42"
            trend="+12.5%↑"
            trendPositive={true}
            icon={<FileText size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <ReportStatsCard
            title="Downloads"
            value="156"
            trend="+8.2%↑"
            trendPositive={true}
            icon={<Download size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
          <ReportStatsCard
            title="Most Viewed"
            value="Sales Report"
            trend="+15.3%↑"
            trendPositive={true}
            icon={<TrendingUp size={24} className="text-[#9333ea]" />}
            iconBg="bg-purple-100"
          />
          <ReportStatsCard
            title="Generated Today"
            value="7"
            trend="-2.4%↓"
            trendPositive={false}
            icon={<Clock size={24} className="text-[#f39c12]" />}
            iconBg="bg-orange-100"
          />
        </div>

        {/* Report Types Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-gray-700" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Report Types</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ReportTypeCard
              title="Sales Report"
              description="Revenue, orders, and product performance."
              icon={<LineChart size={32} className="text-[#3498db]" />}
              iconBg="bg-blue-100"
            />
            <ReportTypeCard
              title="Inventory Report"
              description="Stock levels and product movement."
              icon={<Box size={32} className="text-[#2ecc71]" />}
              iconBg="bg-green-100"
            />
            <ReportTypeCard
              title="Customer Report"
              description="Customer demographics and behavior."
              icon={<Users size={32} className="text-[#9333ea]" />}
              iconBg="bg-purple-100"
            />
            <ReportTypeCard
              title="Marketing Report"
              description="Campaign performance and ROI."
              icon={<Megaphone size={32} className="text-[#f39c12]" />}
              iconBg="bg-orange-100"
            />
          </div>
        </div>

        {/* Recent Reports Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-gray-700" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Reports</h2>
          </div>
          <RecentReportsTable />
        </div>

        {/* Report Analytics Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-gray-700" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Report Analytics</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 border border-gray-200">
            <p className="text-gray-500 text-center text-sm sm:text-base">Report analytics content will be displayed here</p>
          </div>
        </div>
      </div>
    </>
  );
}

