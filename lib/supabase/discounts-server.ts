import { getServerSupabaseClient } from './server'
import type { Discount } from './discounts'

export const discountServerService = {
  // Check if a discount is currently active based on dates
  isDiscountActive(discount: Discount): boolean {
    const now = new Date().getTime()
    
    // If start_date exists, check if we've passed it
    if (discount.start_date) {
      const startTime = new Date(discount.start_date).getTime()
      if (now < startTime) {
        return false
      }
    }
    
    // If end_date exists, check if we haven't passed it
    if (discount.end_date) {
      const endTime = new Date(discount.end_date).getTime()
      if (now > endTime) {
        return false
      }
    }
    
    return true
  },

  // Get active discount for a product (checks both product and category discounts)
  async getProductDiscount(productId: string, categoryId: string): Promise<Discount | null> {
    const supabase = await getServerSupabaseClient()

    // First check for product-specific discount
    const { data: productDiscounts, error: productError } = await supabase
      .from('discounts')
      .select('*')
      .eq('target_type', 'product')
      .eq('target_id', productId)
      .eq('is_active', true)

    if (productError) {
      console.error('Error fetching product discount:', productError)
    }

    // Find active product discount
    if (productDiscounts && productDiscounts.length > 0) {
      for (const discount of productDiscounts) {
        if (this.isDiscountActive(discount)) {
          return discount
        }
      }
    }

    // If no product discount, check for category discount
    const { data: categoryDiscounts, error: categoryError } = await supabase
      .from('discounts')
      .select('*')
      .eq('target_type', 'category')
      .eq('target_id', categoryId)
      .eq('is_active', true)

    if (categoryError) {
      console.error('Error fetching category discount:', categoryError)
    }

    // Find active category discount
    if (categoryDiscounts && categoryDiscounts.length > 0) {
      for (const discount of categoryDiscounts) {
        if (this.isDiscountActive(discount)) {
          return discount
        }
      }
    }

    return null
  },

  // Calculate discounted price
  calculateDiscountedPrice(originalPrice: number, discount: Discount | null): number {
    if (!discount) return originalPrice

    if (discount.discount_type === 'percentage') {
      return originalPrice - (originalPrice * discount.discount_value / 100)
    } else {
      return Math.max(0, originalPrice - discount.discount_value)
    }
  }
}