'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { removeFromWishlist, moveToCart } from '@/lib/actions/wishlist'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface WishlistItemProps {
  item: {
    id: string
    createdAt: string
    product: {
      id: string
      name: string
      price: number
      stock: number
      sku: string
      images: string[]
      description: string
    }
  }
}

export function WishlistItem({ item }: WishlistItemProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const imageUrl = item.product.images?.[0] || '/placeholder-product.jpg'

  const handleRemove = async () => {
    setLoading(true)
    const result = await removeFromWishlist(item.product.id)

    if (result.success) {
      toast.success('Item removed from wishlist')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to remove item')
    }
    setLoading(false)
  }

  const handleMoveToCart = async () => {
    setLoading(true)
    const result = await moveToCart(item.product.id)

    if (result.success) {
      toast.success('Item moved to cart')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to move to cart')
    }
    setLoading(false)
  }

  return (  
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-sm rounded-md py-1">
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Product Image */}
          <Link href={`/products/${item.product.sku}`} className="relative shrink-0">
            <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={item.product.name}
                fill
                sizes="80px"
                className="object-contain"
              />
              {item.product.stock === 0 && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="destructive" className="text-[10px] px-1 py-0.5">Out of Stock</Badge>
                </div>
              )}
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link 
              href={`/products/${item.product.sku}`}
              className="block"
            >
              <h3 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              SKU: {item.product.sku}
            </p>
            
            {/* Price and Stock Info */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-sm font-bold">৳{item.product.price.toFixed(2)}</span>
              {item.product.stock > 0 && item.product.stock <= 10 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {item.product.stock} left
                </Badge>
              )}
              {item.product.stock > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-green-600 font-medium">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-destructive rounded-full"></span>
                  <span className="text-xs text-destructive font-medium">Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Button
              onClick={handleMoveToCart}
              disabled={loading || item.product.stock === 0}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              asChild
            >
              <Link href={`/products/${item.product.sku}`}>
                Details
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={handleRemove}
              disabled={loading}
              title="Remove from wishlist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
