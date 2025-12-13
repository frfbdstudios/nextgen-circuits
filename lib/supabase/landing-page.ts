import { getBrowserSupabaseClient } from './browser'

export interface FeaturedProduct {
  id: string
  product_id: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  product?: {
    id: string
    name: string
    price: number
    images: string[]
    sku: string
    stock: number
  }
}

export interface PopularCategory {
  id: string
  category_id: string
  display_order: number
  is_active: boolean
  custom_image_url: string | null
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    description: string | null
  }
  // Image from first product in this category
  category_image?: string | null
}

export const landingPageService = {
  // ==================== Featured Products ====================
  
  async getFeaturedProducts(): Promise<FeaturedProduct[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('landing_featured_products')
      .select(`
        *,
        product:products (
          id,
          name,
          price,
          images,
          sku,
          stock
        )
      `)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return data || []
  },

  async addFeaturedProduct(productId: string, displayOrder: number = 0): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_featured_products')
      .insert({
        product_id: productId,
        display_order: displayOrder,
        is_active: true
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This product is already featured' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async updateFeaturedProduct(id: string, data: { display_order?: number; is_active?: boolean }): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_featured_products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async removeFeaturedProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_featured_products')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async reorderFeaturedProducts(items: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    for (const item of items) {
      const { error } = await supabase
        .from('landing_featured_products')
        .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
        .eq('id', item.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  },

  // ==================== Popular Categories ====================

  async getPopularCategories(): Promise<PopularCategory[]> {
    const supabase = getBrowserSupabaseClient()
    
    // First, get the popular categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('landing_popular_categories')
      .select(`
        *,
        category:categories (
          id,
          name,
          description
        )
      `)
      .order('display_order', { ascending: true })

    if (categoriesError) {
      console.error('Error fetching popular categories:', categoriesError)
      return []
    }

    if (!categoriesData || categoriesData.length === 0) {
      return []
    }

    // Get category names to fetch product images
    const categoryNames = categoriesData
      .map((c: { category: { name: any } }) => c.category?.name)
      .filter(Boolean) as string[]

    // Fetch first product image for each category
    const { data: productsData } = await supabase
      .from('products')
      .select('category, images')
      .in('category', categoryNames)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // Create a map of category name to first product image
    const categoryImageMap: Record<string, string | null> = {}
    for (const product of productsData || []) {
      if (!categoryImageMap[product.category] && product.images && product.images.length > 0) {
        categoryImageMap[product.category] = product.images[0]
      }
    }

    // Combine data with category images
    return categoriesData.map((item: { custom_image_url: any; category: { name: string | number } }) => ({
      ...item,
      category_image: item.custom_image_url || (item.category?.name ? categoryImageMap[item.category.name] : null)
    }))
  },

  async addPopularCategory(categoryId: string, displayOrder: number = 0, customImageUrl?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_popular_categories')
      .insert({
        category_id: categoryId,
        display_order: displayOrder,
        custom_image_url: customImageUrl || null,
        is_active: true
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This category is already in popular categories' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async updatePopularCategory(id: string, data: { display_order?: number; is_active?: boolean; custom_image_url?: string | null }): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_popular_categories')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async removePopularCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('landing_popular_categories')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  async reorderPopularCategories(items: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    for (const item of items) {
      const { error } = await supabase
        .from('landing_popular_categories')
        .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
        .eq('id', item.id)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  },

  // ==================== Helper Functions ====================

  async getAllProducts(): Promise<{ id: string; name: string; price: number; images: string[]; sku: string }[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, images, sku')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  },

  async getAllCategories(): Promise<{ id: string; name: string; description: string | null; product_count: number; first_image: string | null }[]> {
    const supabase = getBrowserSupabaseClient()
    
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (catError) {
      console.error('Error fetching categories:', catError)
      return []
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // Get product count and first image for each category
    const categoryNames = categories.map((c: { name: any }) => c.name)
    
    const { data: products } = await supabase
      .from('products')
      .select('category, images')
      .in('category', categoryNames)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // Count products and get first image per category
    const categoryStats: Record<string, { count: number; first_image: string | null }> = {}
    for (const product of products || []) {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          count: 0,
          first_image: product.images && product.images.length > 0 ? product.images[0] : null
        }
      }
      categoryStats[product.category].count++
    }

    return categories.map((cat: { name: string | number }) => ({
      ...cat,
      product_count: categoryStats[cat.name]?.count || 0,
      first_image: categoryStats[cat.name]?.first_image || null
    }))
  }
}