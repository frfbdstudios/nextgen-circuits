'use server'

import { getServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { discountServerService } from '@/lib/supabase/discounts-server'

export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in to add items to cart' }
  }

  // Get product stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { success: false, error: 'Product not found' }
  }

  // Check if item already exists in cart
  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    const newQuantity = existing.quantity + quantity
    
    // Check if new quantity exceeds stock
    if (newQuantity > product.stock) {
      return { 
        success: false, 
        error: `Cannot add more items. Only ${product.stock} in stock and you already have ${existing.quantity} in cart.` 
      }
    }

    // Update quantity
    const { error } = await supabase
      .from('carts')
      .update({ quantity: newQuantity })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    // Check if quantity exceeds stock for new item
    if (quantity > product.stock) {
      return { 
        success: false, 
        error: `Cannot add ${quantity} items. Only ${product.stock} in stock.` 
      }
    }

    // Insert new cart item
    const { error } = await supabase
      .from('carts')
      .insert({ user_id: user.id, product_id: productId, quantity })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getCartItems() {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { items: [], total: 0, originalTotal: 0, totalSavings: 0 }
  }

  const { data: cartItems, error } = await supabase
    .from('carts')
    .select(`
      id,
      quantity,
      created_at,
      products (
        id,
        name,
        price,
        stock,
        sku,
        images,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cart:', error)
    return { items: [], total: 0, originalTotal: 0, totalSavings: 0 }
  }

  // Fetch discounts for each product
  const itemsWithDiscounts = await Promise.all(
    (cartItems || []).map(async (item: any) => {
      const product = item.products
      const discount = await discountServerService.getProductDiscount(
        product.id,
        product.category
      )
      
      const originalPrice = product.price
      const discountedPrice = discountServerService.calculateDiscountedPrice(
        originalPrice,
        discount
      )

      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          ...product,
          originalPrice,
          discountedPrice,
          discount,
          savings: (originalPrice - discountedPrice) * item.quantity
        }
      }
    })
  )

  const originalTotal = itemsWithDiscounts.reduce((sum, item) => {
    return sum + (item.product.originalPrice * item.quantity)
  }, 0)

  const total = itemsWithDiscounts.reduce((sum, item) => {
    return sum + (item.product.discountedPrice * item.quantity)
  }, 0)

  const totalSavings = originalTotal - total

  return { 
    items: itemsWithDiscounts, 
    total, 
    originalTotal,
    totalSavings
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await getServerSupabaseClient()
  
  // Get cart item with product stock info
  const { data: cartItem, error: cartError } = await supabase
    .from('carts')
    .select('product_id')
    .eq('id', cartItemId)
    .single()

  if (cartError || !cartItem) {
    return { success: false, error: 'Cart item not found' }
  }

  // Get product stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', cartItem.product_id)
    .single()

  if (productError || !product) {
    return { success: false, error: 'Product not found' }
  }

  // Check if quantity exceeds stock
  if (quantity > product.stock) {
    return { 
      success: false, 
      error: `Cannot set quantity to ${quantity}. Only ${product.stock} in stock.` 
    }
  }

  const { error } = await supabase
    .from('carts')
    .update({ quantity })
    .eq('id', cartItemId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await getServerSupabaseClient()
  
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('id', cartItemId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function clearCart() {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}