"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategorySearchBarProps {
  onSearchChange: (search: string) => void;
  searchValue: string;
}

export function CategorySearchBar({ onSearchChange, searchValue }: CategorySearchBarProps) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="product-search-filters bg-white rounded-lg p-4 sm:p-4 mb-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search categories..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent text-sm sm:text-base"
          />
        </div>
        {searchValue && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="whitespace-nowrap"
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

