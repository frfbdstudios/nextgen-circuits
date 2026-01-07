'use server'

import { getServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToWishlist(productId: string) {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in to add items to wishlist' }
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id: productId })

  if (error) {
    // Check if already exists
    if (error.code === '23505') {
      return { success: false, error: 'Item already in wishlist' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/wishlist')
  revalidatePath('/products')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function removeFromWishlist(productId: string) {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/wishlist')
  revalidatePath('/products')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function checkWishlistStatus(productId: string) {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { inWishlist: false }
  }

  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  return { inWishlist: !!data }
}

export async function getWishlistItems() {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { items: [] }
  }

  const { data: wishlistItems, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      created_at,
      products (
        id,
        name,
        price,
        stock,
        sku,
        images,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching wishlist:', error)
    return { items: [] }
  }

  const items = wishlistItems?.map((item: any) => ({
    id: item.id,
    createdAt: item.created_at,
    product: item.products
  })) || []

  return { items }
}

export async function moveToCart(productId: string) {
  const supabase = await getServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  // Check product stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { success: false, error: 'Product not found' }
  }

  if (product.stock === 0) {
    return { success: false, error: 'Product is out of stock' }
  }

  // Check if already in cart
  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // Update quantity
    const newQuantity = existing.quantity + 1
    
    if (newQuantity > product.stock) {
      return { 
        success: false, 
        error: `Cannot add more items. Only ${product.stock} in stock and you already have ${existing.quantity} in cart.` 
      }
    }

    const { error } = await supabase
      .from('carts')
      .update({ quantity: newQuantity })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    // Add to cart
    const { error } = await supabase
      .from('carts')
      .insert({ user_id: user.id, product_id: productId, quantity: 1 })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  // Remove from wishlist
  await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  revalidatePath('/wishlist')
  revalidatePath('/cart')
  revalidatePath('/', 'layout')
  return { success: true }
}