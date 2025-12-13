'use server'

import { getServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface OrderData {
  recipient_name: string
  recipient_phone: string
  recipient_secondary_phone?: string
  recipient_address: string
  special_instruction?: string
  payment_method: 'cod' | 'bkash' | 'nagad'
  bkash_number?: string
  bkash_transaction_id?: string
  nagad_number?: string
  nagad_transaction_id?: string
  items: any[]
  total: number
}

function calculateDeliveryFee(weightInKg: number, address: string): number {
  const isDhaka = address.toLowerCase().includes('dhaka')
  console.log('Calculating delivery fee for weight:', weightInKg, 'kg to address:', address)
  
  if (weightInKg < 0.5) {
    return isDhaka ? 60 : 110
  } else if (weightInKg < 1) {
    return isDhaka ? 70 : 130
  } else if (weightInKg < 2) {
    return isDhaka ? 90 : 170
  } else {
    // For items >= 2kg, use the highest tier
    return isDhaka ? 90 : 170
  }
}

export async function createOrder(orderData: OrderData) {
  try {
    const supabase = await getServerSupabaseClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Calculate total weight and quantity (50g = 0.05kg per item)
    const item_quantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    const item_weight = orderData.items.reduce((sum, item) => sum + (item.quantity * 0.05), 0) // 0.05kg per item
    

    // Calculate delivery fee
    const delivery_fee = calculateDeliveryFee(item_weight, orderData.recipient_address)
    const total_with_delivery = orderData.total + delivery_fee

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        recipient_secondary_phone: orderData.recipient_secondary_phone || null,
        recipient_address: orderData.recipient_address,
        special_instruction: orderData.special_instruction || null,
        payment_method: orderData.payment_method,
        payment_number: orderData.payment_method === 'bkash' 
          ? orderData.bkash_number 
          : orderData.payment_method === 'nagad' 
          ? orderData.nagad_number 
          : null,
        payment_transaction_id: orderData.payment_method === 'bkash' 
          ? orderData.bkash_transaction_id 
          : orderData.payment_method === 'nagad' 
          ? orderData.nagad_transaction_id 
          : null,
        subtotal: orderData.total,
        delivery_fee: delivery_fee,
        total: total_with_delivery,
        item_quantity,
        item_weight,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return { success: false, error: 'Failed to create order' }
    }

    // Create order items with product snapshots
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
      product_name: item.product.name,
      product_sku: item.product.sku,
      product_image: item.product.images?.[0] || null,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return { success: false, error: 'Failed to create order items' }
    }

    // Update product stock quantities
    for (const item of orderData.items) {
      const { error: stockError } = await supabase.rpc('decrement_product_stock', {
        product_id: item.product.id,
        quantity: item.quantity
      })

      if (stockError) {
        console.error('Stock update error:', stockError)
        // Rollback order and order items
        await supabase.from('order_items').delete().eq('order_id', order.id)
        await supabase.from('orders').delete().eq('id', order.id)
        return { success: false, error: 'Failed to update product stock' }
      }
    }

    // Clear user's cart
    await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id)

    // TODO: Create Pathao order via API
    // This would be done in a separate API route or background job
    // const pathaoResponse = await createPathaoOrder(order)
    // This is done from admin panel after order is created

    revalidatePath('/cart')
    revalidatePath('/orders')
    revalidatePath('/products')

    return { 
      success: true, 
      orderId: order.id,
      deliveryFee: delivery_fee,
      total: total_with_delivery
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function calculateDeliveryFeePreview(address: string, itemCount: number) {
  const weight = itemCount * 0.05 // 50g per item
  return calculateDeliveryFee(weight, address)
}