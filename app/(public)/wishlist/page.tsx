import { getWishlistItems } from '@/lib/actions/wishlist'
import { WishlistItem } from './components/wishlist-item'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Wishlist | NextGen Circuits',
  description: 'View and manage your wishlist',
}

export default async function WishlistPage() {
  const { items } = await getWishlistItems()

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add products to your wishlist to save them for later
            </p>
            <Button asChild>
              <Link href="/products">
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Button variant="default" asChild>
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-2">
          {items.map((item : any) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}