'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { reviewService } from '@/lib/supabase/reviews'

interface ProductRatingProps {
  productId: string
}

export default function ProductRating({ productId }: ProductRatingProps) {
  const [rating, setRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRating()
  }, [productId])

  const loadRating = async () => {
    const stats = await reviewService.getReviewStats(productId)
    setRating(stats.averageRating)
    setTotalReviews(stats.totalReviews)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (totalReviews === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Star className="w-4 h-4 text-gray-300" />
        <span>No reviews</span>
      </div>
    )
  }

  const full = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const empty = 5 - Math.ceil(rating)

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
      <span className="text-xs text-gray-600">({totalReviews})</span>
    </div>
  )
}