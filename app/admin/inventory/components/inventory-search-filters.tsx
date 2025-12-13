"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InventorySearchFilters() {
  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search inventory..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
        />
      </div>
      
      <Select defaultValue="all-categories">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-categories">All Categories</SelectItem>
          <SelectItem value="resistors">Resistors</SelectItem>
          <SelectItem value="capacitors">Capacitors</SelectItem>
          <SelectItem value="development-boards">Development Boards</SelectItem>
          <SelectItem value="ics">Integrated Circuits</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-status">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-status">All Status</SelectItem>
          <SelectItem value="healthy">Healthy Stock</SelectItem>
          <SelectItem value="low-stock">Low Stock</SelectItem>
          <SelectItem value="out-of-stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

