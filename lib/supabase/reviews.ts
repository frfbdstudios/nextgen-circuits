import { getBrowserSupabaseClient } from './browser'
import type { User } from '@supabase/supabase-js'

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment: string
  media_urls: string[]
  verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  profile?: {
    full_name: string
    avatar_url: string
  }
}

export interface CreateReviewData {
  product_id: string
  rating: number
  title?: string
  comment: string
  media_files?: File[]
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export const reviewService = {
  async getProductReviews(productId: string): Promise<Review[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles!reviews_user_id_fkey(full_name, avatar_url)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error.message, error.details, error.hint)
      return []
    }

    return data || []
  },

  async hasUserReviewed(userId: string, productId: string): Promise<boolean> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    return !!data && !error
  },

  async getUserReview(userId: string, productId: string): Promise<Review | null> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles!reviews_user_id_fkey(full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error) {
      return null
    }

    return data
  },

  async createReview(user: User, reviewData: CreateReviewData): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      // Check if user has already reviewed this product
      const hasReviewed = await this.hasUserReviewed(user.id, reviewData.product_id)
      if (hasReviewed) {
        return { success: false, error: 'You have already reviewed this product' }
      }

      // Upload media files if any
      const mediaUrls: string[] = []
      
      if (reviewData.media_files && reviewData.media_files.length > 0) {
        for (const file of reviewData.media_files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('review-media')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Error uploading file:', uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('review-media')
            .getPublicUrl(fileName)

          mediaUrls.push(publicUrl)
        }
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: reviewData.product_id,
          user_id: user.id,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          media_urls: mediaUrls
        })

      if (insertError) {
        console.error('Error creating review:', insertError.message, insertError.details)
        
        // Check for unique constraint violation
        if (insertError.code === '23505') {
          return { success: false, error: 'You have already reviewed this product' }
        }
        
        return { success: false, error: insertError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error creating review:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  async updateReview(reviewId: string, userId: string, reviewData: Partial<CreateReviewData>): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      // Upload new media files if any
      const mediaUrls: string[] = []
      
      if (reviewData.media_files && reviewData.media_files.length > 0) {
        for (const file of reviewData.media_files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('review-media')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Error uploading file:', uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('review-media')
            .getPublicUrl(fileName)

          mediaUrls.push(publicUrl)
        }
      }

      // Update review
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (reviewData.rating) updateData.rating = reviewData.rating
      if (reviewData.title !== undefined) updateData.title = reviewData.title
      if (reviewData.comment) updateData.comment = reviewData.comment
      if (mediaUrls.length > 0) updateData.media_urls = mediaUrls

      const { error: updateError } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating review:', updateError.message)
        return { success: false, error: updateError.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error updating review:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  async getReviewStats(productId: string): Promise<ReviewStats> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching review stats:', error.message, error.details)
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const totalReviews = data.length
    const ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number } = { 
      1: 0, 
      2: 0, 
      3: 0, 
      4: 0, 
      5: 0 
    }
    let totalRating = 0

    data.forEach((review: { rating: number }) => {
      totalRating += review.rating
      ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++
    })

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

    return { averageRating, totalReviews, ratingDistribution }
  },

  async deleteReview(reviewId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    try {
      // Get review media URLs first
      const { data: review } = await supabase
        .from('reviews')
        .select('media_urls')
        .eq('id', reviewId)
        .eq('user_id', userId)
        .single()

      if (review && review.media_urls && review.media_urls.length > 0) {
        // Delete media files
        for (const url of review.media_urls) {
          const fileName = url.split('/').pop()
          if (fileName) {
            await supabase.storage
              .from('review-media')
              .remove([`${userId}/${fileName}`])
          }
        }
      }

      // Delete review
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting review:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}