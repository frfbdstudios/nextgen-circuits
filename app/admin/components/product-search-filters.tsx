"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ProductSearchFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  categories: string[];
}

export function ProductSearchFilters({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  categories,
}: ProductSearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange(value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    onSearchChange("");
    onCategoryChange("all");
    onStatusChange("all");
  };

  return (
    <div className="product-search-filters bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 w-full sm:min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        {/* <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {/* <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="low-stock">Low Stock (&lt;50)</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select> */}

        {(search || category !== "all" || status !== "all") && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

