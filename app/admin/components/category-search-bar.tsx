"use client";

import { Search } from "lucide-react";

export function CategorySearchBar() {
  return (
    <div className="product-search-filters bg-white rounded-lg p-4 sm:p-4 mb-6 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent text-sm sm:text-base"
        />
      </div>
    </div>
  );
}

