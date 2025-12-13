"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { CustomerTable } from "./components/customer-table";
import { CustomerSearchFilters } from "./components/customer-search-filters";
import { AdminHeader } from "../components/admin-header";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="size-6 sm:size-8 text-[#3498db]" />
            <div>
              <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">
                Customer Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your customer base
              </p>
            </div>
          </div>
          {/* Removed Add New Customer button as customers are created through registration */}
        </div>

        {/* Search and Filters */}
        <CustomerSearchFilters
          onSearchChange={setSearchQuery}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Customer Table */}
        <CustomerTable
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
        />
      </div>
    </>
  );
}

