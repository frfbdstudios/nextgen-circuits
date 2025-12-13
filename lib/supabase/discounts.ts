import { getBrowserSupabaseClient } from './browser'

export interface Discount {
  id: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  target_type: 'product' | 'category'
  target_id: string
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface CreateDiscountData {
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  target_type: 'product' | 'category'
  target_id: string
  is_active?: boolean
  start_date?: string
  end_date?: string
}

export const discountService = {
  // Get all discounts
  async getDiscounts(): Promise<Discount[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discounts:', error)
      return []
    }

    return data || []
  },

  // Get active discount for a product (checks both product and category discounts)
  async getProductDiscount(productId: string, categoryId: string): Promise<Discount | null> {
    const supabase = getBrowserSupabaseClient()
    const now = new Date()

    console.log('Checking discount for product:', productId, 'category:', categoryId)
    console.log('Current time:', now.toISOString())

    // First check for product-specific discount
    const { data: productDiscounts, error: productError } = await supabase
      .from('discounts')
      .select('*')
      .eq('target_type', 'product')
      .eq('target_id', productId)
      .eq('is_active', true)

    console.log('Product Discounts fetched:', productDiscounts)

    if (productError) {
      console.error('Error fetching product discount:', productError)
    }

    // Filter by date on the client side
    const activeProductDiscount = productDiscounts?.find((discount: { start_date: string | number | Date; end_date: string | number | Date; name: any }) => {
      const startValid = !discount.start_date || new Date(discount.start_date) <= now
      const endValid = !discount.end_date || new Date(discount.end_date) >= now
      
      console.log('Checking product discount:', discount.name)
      console.log('  Start date:', discount.start_date, 'Valid:', startValid)
      console.log('  End date:', discount.end_date, 'Valid:', endValid)
      console.log('  Overall valid:', startValid && endValid)
      
      return startValid && endValid
    })

    if (activeProductDiscount) {
      console.log('Active product discount found:', activeProductDiscount.name)
      return activeProductDiscount
    }

    // If no product discount, check for category discount
    const { data: categoryDiscounts, error: categoryError } = await supabase
      .from('discounts')
      .select('*')
      .eq('target_type', 'category')
      .eq('target_id', categoryId)
      .eq('is_active', true)

    console.log('Category Discounts fetched:', categoryDiscounts)

    if (categoryError) {
      console.error('Error fetching category discount:', categoryError)
    }

    // Filter by date on the client side
    const activeCategoryDiscount = categoryDiscounts?.find((discount: { start_date: string | number | Date; end_date: string | number | Date; name: any }) => {
      const startValid = !discount.start_date || new Date(discount.start_date) <= now
      const endValid = !discount.end_date || new Date(discount.end_date) >= now
      
      console.log('Checking category discount:', discount.name)
      console.log('  Start date:', discount.start_date, 'Valid:', startValid)
      console.log('  End date:', discount.end_date, 'Valid:', endValid)
      console.log('  Overall valid:', startValid && endValid)
      
      return startValid && endValid
    })

    if (activeCategoryDiscount) {
      console.log('Active category discount found:', activeCategoryDiscount.name)
    }

    return activeCategoryDiscount || null
  },

  // Calculate discounted price
  calculateDiscountedPrice(originalPrice: number, discount: Discount | null): number {
    if (!discount) return originalPrice

    if (discount.discount_type === 'percentage') {
      return originalPrice - (originalPrice * discount.discount_value / 100)
    } else {
      return Math.max(0, originalPrice - discount.discount_value)
    }
  },

  // Create discount
  async createDiscount(discountData: CreateDiscountData): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      const { error } = await supabase
        .from('discounts')
        .insert(discountData)

      if (error) {
        console.error('Error creating discount:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error creating discount:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Update discount
  async updateDiscount(id: string, discountData: Partial<CreateDiscountData>): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      const { error } = await supabase
        .from('discounts')
        .update(discountData)
        .eq('id', id)

      if (error) {
        console.error('Error updating discount:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error updating discount:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Delete discount
  async deleteDiscount(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting discount:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting discount:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Toggle discount active status
  async toggleDiscount(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateDiscount(id, { is_active: isActive })
  }
}