"use client";

import { Edit, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const inventoryItems = [
  {
    id: "1",
    product: "10k Resistor",
    sku: "RES-10K-100",
    category: "Resistors",
    stockLevel: 1500,
    stockColor: "text-green-600",
    minStock: 100,
    lastUpdated: "Feb 15, 2024, 12:00 AM",
  },
  {
    id: "2",
    product: "100uF Capacitor",
    sku: "CAP-100UF-50",
    category: "Capacitors",
    stockLevel: 50,
    stockColor: "text-orange-600",
    minStock: 100,
    lastUpdated: "Feb 14, 2024, 12:00 AM",
  },
];

export function InventoryTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Product</TableHead>
            <TableHead className="font-semibold text-gray-700">SKU</TableHead>
            <TableHead className="font-semibold text-gray-700">Category</TableHead>
            <TableHead className="font-semibold text-gray-700">Stock Level</TableHead>
            <TableHead className="font-semibold text-gray-700">Min. Stock</TableHead>
            <TableHead className="font-semibold text-gray-700">Last Updated</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">{item.product}</TableCell>
              <TableCell className="text-gray-700">{item.sku}</TableCell>
              <TableCell className="text-gray-700">{item.category}</TableCell>
              <TableCell>
                <span className={`font-medium ${item.stockColor}`}>
                  {item.stockLevel}
                </span>
              </TableCell>
              <TableCell className="text-gray-700">{item.minStock}</TableCell>
              <TableCell className="text-gray-700">{item.lastUpdated}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                    aria-label="Edit inventory"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                    aria-label="Refresh inventory"
                  >
                    <RefreshCw size={16} className="text-gray-600" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

