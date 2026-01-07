"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product } from "../products/page";
import { EditProductDialog } from "./edit-product-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ViewProductDialog } from "./view-product-dialog";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onRefresh: () => void
}

export function ProductTable({ products, loading, onRefresh }: ProductTableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchCategories() {
      const supabase = getBrowserSupabaseClient();
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");

      if (categories) {
        const map = categories.reduce((acc: { [x: string]: any; }, cat: { id: string | number; name: any; }) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {} as Record<string, string>);
        setCategoryMap(map);
      }
    }

    fetchCategories();
  }, []);

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600"
    if (stock < 50) return "text-yellow-600"
    return "text-green-600"
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "OUT OF STOCK", color: "bg-red-500" }
    if (stock < 50) return { label: "LOW STOCK", color: "bg-orange-500" }
    return { label: "IN STOCK", color: "bg-green-500" }
  }

  const getCategoryName = (categoryId: string) => {
    return categoryMap[categoryId] || categoryId;
  }

  if (loading) {
    return (
      <div className="product-table-wrapper bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db]"></div>
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="product-table-wrapper bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Add your first product to get started</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="product-table-wrapper bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Product</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">Category</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Stock</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Price</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">Stock Status</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap hidden lg:table-cell">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                const categoryName = getCategoryName(product.category)
                return (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="min-w-[150px]">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{product.sku}</div>
                        <div className="text-xs text-gray-600 mt-1 sm:hidden">
                          {categoryName}
                        </div>
                        {/* Mobile: Show both statuses */}
                        <div className="flex gap-1 mt-1 md:hidden">
                          <Badge className={`${stockStatus.color} text-white text-xs`}>
                            {stockStatus.label}
                          </Badge>
                          <Badge className={`${product.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs`}>
                            {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 hidden sm:table-cell">
                      {categoryName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`font-medium ${getStockColor(product.stock)}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                      ৳{product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={`${stockStatus.color} text-white`}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`${product.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                        {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                          aria-label="View product"
                          onClick={() => setViewingProduct(product)}
                        >
                          <Eye size={14} className="sm:size-4 text-blue-600" />
                        </button>
                        <button
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                          aria-label="Edit product"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit size={14} className="sm:size-4 text-gray-600" />
                        </button>
                        <button
                          className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label="Delete product"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 size={14} className="sm:size-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Product Dialog */}
      {viewingProduct && (
        <ViewProductDialog
          product={viewingProduct}
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null)
            onRefresh()
          }}
        />
      )}

      {/* Delete Product Dialog */}
      {deletingProduct && (
        <DeleteProductDialog
          product={deletingProduct}
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onSuccess={() => {
            setDeletingProduct(null)
            onRefresh()
          }}
        />
      )}
    </>
  );
}

