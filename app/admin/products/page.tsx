'use client'

import { useState, useEffect, useMemo } from "react"
import { ShoppingBag, Tag, AlertTriangle, DollarSign, RefreshCw, Plus } from "lucide-react"
import { ProductStatsCard } from "../components/product-stats-card"
import { ProductTable } from "../components/product-table"
import { ProductSearchFilters } from "../components/product-search-filters"
import { AdminHeader } from "../components/admin-header"
import { AddProductDialog, ProductFormData } from "../components/add-product-dialog"
import { Button } from "@/components/ui/button"
import { getBrowserSupabaseClient } from "@/lib/supabase/browser"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"
import { isAdmin } from "@/lib/supabase/role-access-control"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  images: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  buyingPrice?: number
  profitMargin?: number
}

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const supabase = getBrowserSupabaseClient()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_costs (
            buying_price,
            effective_date
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map products with their latest buying price
      const productsWithCosts = (data || []).map((product: { product_costs: any[]; price: number }) => {
        const latestCost = product.product_costs?.[0]
        const buyingPrice = latestCost?.buying_price || 0
        const profitMargin = buyingPrice > 0 
          ? ((product.price - buyingPrice) / buyingPrice * 100)
          : 0

        return {
          ...product,
          buyingPrice,
          profitMargin,
          product_costs: undefined // Remove the nested object
        }
      })

      setProducts(productsWithCosts)
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort()
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

      // Status filter
      let matchesStatus = true
      if (statusFilter === "active") {
        matchesStatus = product.is_active && product.stock > 0
      } else if (statusFilter === "low-stock") {
        matchesStatus = product.stock > 0 && product.stock < 50
      } else if (statusFilter === "out-of-stock") {
        matchesStatus = product.stock === 0
      } else if (statusFilter === "inactive") {
        matchesStatus = !product.is_active
      }

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, categoryFilter, statusFilter])

  const handleAddProduct = async (product: ProductFormData, imageFiles: File[]) => {
    setIsSubmitting(true)

    try {
      console.log('Current user object:', user)
      console.log('User ID:', user?.id)
      
      const userIsAdmin = await isAdmin(user)
      console.log('Is Admin:', userIsAdmin)

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session)
      console.log('Session user ID:', session?.user?.id)
      
      if (!userIsAdmin) {
        toast.error("Only admins can add products")
        setIsSubmitting(false)
        return
      }

      const imageUrls: string[] = []

      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${product.sku}-${Date.now()}-${i}.${fileExt}`
          const filePath = `products/${fileName}`

          const { error: uploadError, data } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath)

          imageUrls.push(publicUrl)
        }
      }

      // Insert product (without buying price)
      const { data: productData, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          sku: product.sku,
          images: imageUrls,
          is_active: product.isActive ?? true,
          created_by: session?.user?.id || user?.id
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        // Clean up uploaded images
        for (const url of imageUrls) {
          const path = url.split('/').slice(-2).join('/')
          await supabase.storage.from('product-images').remove([path])
        }
        throw error
      }

      // Insert buying price into product_costs table
      const { error: costError } = await supabase
        .from('product_costs')
        .insert({
          product_id: productData.id,
          buying_price: product.buyingPrice,
          notes: 'Initial cost',
          created_by: session?.user?.id || user?.id,
        })

      if (costError) {
        console.error('Error inserting product cost:', costError)
        toast.error('Product added but failed to save buying price')
      } else {
        toast.success(`Product "${product.name}" added successfully`)
      }

      fetchProducts()
      setIsDialogOpen(false)

    } catch (error: any) {
      console.error('Error adding product:', error)
      toast.error(error.message || "Failed to add product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsSubmitting(false)
  }

  // Calculate stats based on filtered products
  const totalProducts = filteredProducts.length
  const categoriesCount = new Set(filteredProducts.map(p => p.category)).size
  const lowStockItems = filteredProducts.filter(p => p.stock > 0 && p.stock < 50).length
  const inventoryValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)

  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="products-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="products-page-title text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your electronic components</p>
          </div>
          <div className="products-page-actions flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchProducts} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-[#3498db] hover:bg-[#2980b9]"
              onClick={() => setIsDialogOpen(true)}
              disabled={!isAdmin(user)}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <ProductStatsCard
            title="Total Products"
            value={totalProducts.toString()}
            // trend="+12.5%↑"
            trendPositive={true}
            icon={<ShoppingBag size={24} className="text-[#3498db]" />}
            iconBg="bg-blue-100"
          />
          <ProductStatsCard
            title="Categories"
            value={categoriesCount.toString()}
            // trend="+2↑"
            trendPositive={true}
            icon={<Tag size={24} className="text-[#2ecc71]" />}
            iconBg="bg-green-100"
          />
          <ProductStatsCard
            title="Low Stock Items"
            value={lowStockItems.toString()}
            // trend="+5↑"
            trendPositive={false}
            icon={<AlertTriangle size={24} className="text-[#9333ea]" />}
            iconBg="bg-purple-100"
          />
          <ProductStatsCard
            title="Inventory Value"
            value={`৳${inventoryValue.toFixed(2)}`}
            // trend="+8.3%↑"
            trendPositive={true}
            icon={<DollarSign size={24} className="text-[#e74c3c]" />}
            iconBg="bg-red-100"
          />
        </div>

        {/* Search and Filters */}
        <ProductSearchFilters
          onSearchChange={setSearchQuery}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Product Table */}
        <ProductTable products={filteredProducts} loading={loading} onRefresh={fetchProducts} />

        {/* Add Product Dialog */}
        <AddProductDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleAddProduct}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  )
}

