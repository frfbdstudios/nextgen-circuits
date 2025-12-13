'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/lib/actions/wishlist'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AddToWishlistButtonProps {
  productId: string
  initialInWishlist: boolean
}

export default function AddToWishlistButton({ productId, initialInWishlist }: AddToWishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleWishlist = async () => {
    setLoading(true)
    
    if (inWishlist) {
      const result = await removeFromWishlist(productId)
      if (result.success) {
        setInWishlist(false)
        toast.success('Removed from wishlist')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to remove from wishlist')
      }
    } else {
      const result = await addToWishlist(productId)
      if (result.success) {
        setInWishlist(true)
        toast.success('Added to wishlist')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to add to wishlist')
      }
    }
    
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`inline-flex items-center gap-2 transition-colors ${
        inWishlist 
          ? 'text-red-600 hover:text-red-700' 
          : 'text-primary hover:text-primary/80'
      } disabled:opacity-50`}
    >
      <Heart 
        size={20} 
        className={inWishlist ? 'fill-current' : ''} 
      />
      {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </button>
  )
}