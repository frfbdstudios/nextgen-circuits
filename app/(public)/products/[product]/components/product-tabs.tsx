'use client'

import { useState, useEffect } from 'react'
import { reviewService, type Review, type ReviewStats } from '@/lib/supabase/reviews'
import ReviewForm from './review-form'
import { Star } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  images: string[]
  is_active: boolean
  created_at: string
}

interface ProductTabsProps {
  product: Product
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const user = useUser().user

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load reviews
    loadReviews()
  }, [product.id])

  const loadReviews = async () => {
    setIsLoading(true)
    const [reviewsData, stats] = await Promise.all([
      reviewService.getProductReviews(product.id),
      reviewService.getReviewStats(product.id)
    ])
    setReviews(reviewsData)
    setReviewStats(stats)
    setIsLoading(false)
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    loadReviews()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Description Section */}
      <div>
        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
            {reviewStats.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{reviewStats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({reviewStats.totalReviews} reviews)</span>
              </div>
            )}
          </div>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {reviewStats.totalReviews > 0 && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((rating) => {
                const count = reviewStats.ratingDistribution[rating]
                const percentage = (count / reviewStats.totalReviews) * 100
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="text-sm w-12">{rating} star</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
            {!user && (
              <p className="text-sm text-gray-400">Please log in to write a review</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.profile?.avatar_url ? (
                      <img
                        src={review.profile.avatar_url}
                        alt={review.profile.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {review.profile?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{review.profile?.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}
                
                <p className="text-gray-700 mb-3">{review.comment}</p>

                {review.media_urls && review.media_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                    {review.media_urls.map((url, index) => {
                      const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
                      return (
                        <div key={index} className="aspect-square max-w-[200px] max-h-[200px] w-32 h-32">
                          {isVideo ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Review media ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(url, '_blank')}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && user && (
        <ReviewForm
          productId={product.id}
          user={user}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  )
}


