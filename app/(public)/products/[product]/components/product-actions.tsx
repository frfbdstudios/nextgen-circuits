'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { addToCart } from '@/lib/actions/cart'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'

interface ProductActionsProps {
  stock: number
  productId: string
  sku: string
}

export default function ProductActions({ stock, productId }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const user = useUser().user

  const handleAddToCart = async () => {
    if (stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    if (!user) {
      toast.error('Please log in to add items to your cart')
      router.push('/login')
      return
    }

    setLoading(true)
    const result = await addToCart(productId, quantity)

    if (result.success) {
      toast.success(`Added ${quantity} item(s) to cart`)
      setQuantity(1) // Reset quantity after successful add
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to add to cart')
    }

    setLoading(false)
  }

  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1)
    } else {
      toast.warning(`Maximum ${stock} items available`)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row  items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="px-6 py-3 min-w-[80px] text-center font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={incrementQuantity}
            disabled={quantity >= stock}
            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading || stock === 0}
          className="w-full flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          {loading ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <button
          type="button"
          onClick={
            () => {
              handleAddToCart()
              if (user) router.push('/checkout')
            }
          }
          disabled={loading || stock === 0}
          className="w-full flex-1 bg-secondary text-white py-3 px-6 rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          {loading ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>

      {stock > 0 && stock <= 10 && (
        <p className="text-sm text-orange-600">
          Only {stock} items left in stock!
        </p>
      )}
    </div>
  )
}


