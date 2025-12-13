"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerSearchFiltersProps {
  onSearchChange: (search: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
}

export function CustomerSearchFilters({
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: CustomerSearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    onRoleChange(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
    onSearchChange("");
    onRoleChange("all");
    onStatusChange("all");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full lg:w-48">
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        {/* <div className="w-full lg:w-48">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Clear Filters */}
        {(search || role !== "all" || status !== "all") && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full lg:w-auto"
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

