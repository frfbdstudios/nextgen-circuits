'use client';

import { Tag, Box, TrendingUp, Calendar, RefreshCw, Plus } from "lucide-react";
import { ProductStatsCard } from "../components/product-stats-card";
import { CategoryTable } from "../components/category-table";
import { CategorySearchBar } from "../components/category-search-bar";
import { AdminHeader } from "../components/admin-header";
import { CreateCategoryDialog, CategoryFormData } from "../components/create-category-dialog";
import { useState, useEffect, useMemo } from "react";
import { getBrowserSupabaseClient } from '@/lib/supabase/browser';
import { useUser } from '@/hooks/use-user';
import { isAdmin } from '@/lib/supabase/role-access-control';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const supabase = getBrowserSupabaseClient();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleCreateCategory = async (categoryData: CategoryFormData) => {
    try {
      const userIsAdmin = await isAdmin(user);
      if (!userIsAdmin) {
        toast.error("Only admins can create categories");
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      toast.success(`Category "${categoryData.name}" created successfully`);
      setIsDialogOpen(false);
      fetchCategories(); // Refresh the category list
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.message || "Failed to create category");
    }
  };

  // Calculate stats
  const totalCategories = categories.length;
  const totalProducts = 254; // This should be fetched from products table or passed as prop
  const mostPopularCategory = "Development Boards"; // This should be calculated
  const lastAddedCategory = categories.length > 0 ? categories[0].name : "None";

  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product categories</p>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <button 
              onClick={fetchCategories}
              className="products-action-btn px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="products-action-btn px-3 sm:px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Category</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <ProductStatsCard
            title="Total Categories"
            value={totalCategories.toString()}
            trend="+2↑"
            trendPositive={true}
            icon={<Tag size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <ProductStatsCard
            title="Total Products"
            value={totalProducts.toString()}
            trend="+12.5%↑"
            trendPositive={true}
            icon={<Box size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
          <ProductStatsCard
            title="Most Popular"
            value={mostPopularCategory}
            subtitle="45 products ↑"
            trend=""
            trendPositive={true}
            icon={<TrendingUp size={24} className="text-[#9333ea]" />}
            iconBg="bg-purple-100"
          />
          <ProductStatsCard
            title="Last Added"
            value={lastAddedCategory}
            subtitle="Just now"
            trend=""
            trendPositive={true}
            icon={<Calendar size={24} className="text-[#f39c12]" />}
            iconBg="bg-orange-100"
          />
        </div>

        {/* Search Bar */}
        <CategorySearchBar 
          onSearchChange={setSearchQuery}
          searchValue={searchQuery}
        />

        {/* Category Table */}
        <CategoryTable 
          categories={filteredCategories} 
          loading={loading} 
          onRefresh={fetchCategories} 
        />
      </div>

      {/* Create Category Dialog */}
      <CreateCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </>
  );
}

