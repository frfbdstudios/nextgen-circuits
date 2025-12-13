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
import { Category } from "../categories/page";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { ViewCategoryDialog } from "./view-category-dialog";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  onRefresh: () => void;
}

export function CategoryTable({ categories, loading, onRefresh }: CategoryTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    const fetchProductCounts = async () => {
      if (categories.length === 0) return;

      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.id);
        
        if (!error && count !== null) {
          counts[category.id] = count;
        }
      }
      
      setProductCounts(counts);
    };

    fetchProductCounts();
  }, [categories, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1, 4);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db]"></div>
          <span className="ml-3 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No categories found</p>
          <p className="text-sm mt-1">Add your first category to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Products</TableHead>
              <TableHead className="font-semibold text-gray-700">Created Date</TableHead>
              {/* <TableHead className="font-semibold text-gray-700">Status</TableHead> */}
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#3498db] text-white flex items-center justify-center font-semibold text-xs">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 font-medium">
                  {productCounts[category.id] ?? 0}
                </TableCell>
                <TableCell className="text-gray-700">{formatDate(category.created_at)}</TableCell>
                {/* <TableCell>
                  <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                </TableCell> */}
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                      aria-label="View category"
                      onClick={() => setViewingCategory(category)}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                      aria-label="Edit category"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      aria-label="Delete category"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Category Dialog */}
      {viewingCategory && (
        <ViewCategoryDialog
          category={viewingCategory}
          isOpen={!!viewingCategory}
          onClose={() => setViewingCategory(null)}
        />
      )}

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null);
            onRefresh();
          }}
        />
      )}

      {/* Delete Category Dialog */}
      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onSuccess={() => {
            setDeletingCategory(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

