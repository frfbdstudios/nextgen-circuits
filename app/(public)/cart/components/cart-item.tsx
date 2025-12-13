'use client'

import Image from 'next/image'
import Link from 'next/link'
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface CartItemProps {
  item: {
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      originalPrice: number
      discountedPrice: number
      discount: any
      savings: number
      stock: number
      sku: string
      images: string[]
    }
  }
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(true)
    const result = await updateCartQuantity(item.id, newQuantity)
    
    if (!result.success) {
      toast.error(result.error || 'Failed to update quantity')
    }
    
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    const result = await removeFromCart(item.id)
    
    if (!result.success) {
      toast.error(result.error || 'Failed to remove item')
      setIsRemoving(false)
    } else {
      toast.success('Item removed from cart')
    }
  }

  const imageUrl = item.product.images && item.product.images.length > 0
    ? item.product.images[0]
    : '/placeholder-product.jpg'

  const hasDiscount = item.product.discount !== null
  const itemTotal = item.product.discountedPrice * item.quantity
  const originalItemTotal = item.product.originalPrice * item.quantity

  return (
    <div className="py-6 flex gap-4">
      <div className="relative h-10 w-10 md:h-24 md:w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Link href={`/products/${item.product.sku}`}>
          <Image
            src={imageUrl}
            alt={item.product.name}
            fill
            className="object-contain"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <div>
              <Link 
                href={`/products/${item.product.sku}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {item.product.name}
              </Link>
              {hasDiscount && (
                <Badge className="ml-2 bg-red-500 text-xs">
                  {item.product.discount.discount_type === 'percentage' 
                    ? `${item.product.discount.discount_value}% OFF`
                    : `৳${item.product.discount.discount_value} OFF`
                  }
                </Badge>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                SKU: {item.product.sku}
              </p>
            </div>
            
            <div className="text-right">
              {hasDiscount ? (
                <>
                  <p className="font-semibold text-red-600">৳{itemTotal.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 line-through">৳{originalItemTotal.toFixed(2)}</p>
                  <p className="text-xs text-green-600">Save ৳{item.product.savings.toFixed(2)}</p>
                </>
              ) : (
                <p className="font-semibold">৳{itemTotal.toFixed(2)}</p>
              )}
            </div>
          </div>

          {hasDiscount && (
            <div className="mt-1">
              <p className="text-xs text-gray-600">
                Unit: <span className="line-through text-gray-400">৳{item.product.originalPrice.toFixed(2)}</span>
                {' → '}
                <span className="text-red-600 font-medium">৳{item.product.discountedPrice.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <span className="w-12 text-center font-medium">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>

        {item.product.stock <= 10 && (
          <p className="text-xs text-yellow-600 mt-2">
            Only {item.product.stock} left in stock
          </p>
        )}
      </div>
    </div>
  )
}