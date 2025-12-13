'use client'

import { useState, useEffect } from 'react'
import { CheckoutForm } from './components/checkout-form'
import { getCartItems } from '@/lib/actions/cart'
import { redirect } from 'next/navigation'
import { Truck } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [originalTotal, setOriginalTotal] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCart() {
      const cart = await getCartItems()
      if (cart.items.length === 0) {
        redirect('/cart')
      }
      setItems(cart.items)
      setTotal(cart.total)
      setOriginalTotal(cart.originalTotal)
      setTotalSavings(cart.totalSavings)
      setLoading(false)
    }
    loadCart()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  const finalTotal = deliveryFee !== null ? total + deliveryFee : total
  const hasSavings = totalSavings > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm 
              items={items} 
              total={total} 
              onDeliveryFeeChange={setDeliveryFee}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {items.map((item: any) => {
                    const itemHasDiscount = item.product.discount !== null
                    const itemPrice = item.product.discountedPrice * item.quantity
                    const itemOriginalPrice = item.product.originalPrice * item.quantity
                    
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product.name} × {item.quantity}
                          </span>
                          {itemHasDiscount ? (
                            <div className="text-right">
                              <div>
                                <span className="text-red-600 font-medium">৳{itemPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-gray-400 line-through">
                                ৳{itemOriginalPrice.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">
                              ৳{itemPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    {hasSavings ? (
                      <div className="text-right">
                        <span className="line-through text-gray-400 text-xs mr-2">
                          ৳{originalTotal.toFixed(2)}
                        </span>
                        <span className="font-medium text-red-600">
                          ৳{total.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">৳{total.toFixed(2)}</span>
                    )}
                  </div>

                  {hasSavings && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount Savings</span>
                      <span className="font-medium text-green-600">
                        -৳{totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Delivery Fee
                    </span>
                    <span className="font-medium">
                      {deliveryFee !== null ? `৳${deliveryFee.toFixed(2)}` : 'Enter address'}
                    </span>
                  </div>

                  <Separator className="my-2" />
                  
                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        ৳{deliveryFee !== null ? finalTotal.toFixed(2) : total.toFixed(2)}
                      </span>
                    </div>
                    {deliveryFee === null && (
                      <p className="text-xs mt-1 text-muted-foreground text-right">
                        + Delivery fee
                      </p>
                    )}
                  </div>

                  {hasSavings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-700 font-medium text-center">
                        🎉 You're saving ৳{totalSavings.toFixed(2)}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}