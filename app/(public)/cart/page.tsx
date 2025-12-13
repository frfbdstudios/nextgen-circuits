import { getCartItems } from '@/lib/actions/cart'
import { CartItem } from './components/cart-item'
import { CartSummary } from './components/cart-summary'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Shopping Cart | NextGen Circuits',
  description: 'View and manage your shopping cart',
}

export default async function CartPage() {
  const { items, total, originalTotal, totalSavings } = await getCartItems()

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart to see them here
            </p>
            <Button asChild>
              <Link href="/products">
                Continue Shopping
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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 min-w-0">
            <div className="bg-card rounded-lg border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Cart Items ({items.length})
              </h2>
              <div className="divide-y overflow-x-auto">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CartSummary 
                subtotal={total} 
                originalTotal={originalTotal}
                totalSavings={totalSavings}
                itemCount={items.length} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}