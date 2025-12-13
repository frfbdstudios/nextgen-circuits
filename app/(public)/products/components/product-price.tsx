'use client'

import { useEffect, useState } from 'react'
import { discountService, type Discount } from '@/lib/supabase/discounts'
import { Badge } from '@/components/ui/badge'

interface ProductPriceProps {
  productId: string
  categoryId: string
  originalPrice: number
}

export default function ProductPrice({ productId, categoryId, originalPrice }: ProductPriceProps) {
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDiscount()
  }, [productId, categoryId])

  const loadDiscount = async () => {
    const discountData = await discountService.getProductDiscount(productId, categoryId)
    setDiscount(discountData)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900 animate-pulse">
          ৳{originalPrice.toFixed(2)}
        </span>
        <span className="text-xs text-gray-500">BDT</span>
      </div>
    )
  }

  if (!discount) {
    return (
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900">৳{originalPrice.toFixed(2)}</span>
        <span className="text-xs text-gray-500">BDT</span>
      </div>
    )
  }

  const discountedPrice = discountService.calculateDiscountedPrice(originalPrice, discount)
  const savingsAmount = originalPrice - discountedPrice
  const savingsPercentage = ((savingsAmount / originalPrice) * 100).toFixed(0)

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-red-600">৳{discountedPrice.toFixed(2)}</span>
        <span className="text-sm text-gray-400 line-through">৳{originalPrice.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">BDT</span>
        <span className="text-xs text-green-600 font-medium">
          Save {savingsPercentage}%
        </span>
      </div>
    </div>
  )
}