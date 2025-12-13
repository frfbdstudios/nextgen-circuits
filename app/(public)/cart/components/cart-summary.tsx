'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface CartSummaryProps {
  subtotal: number
  originalTotal: number
  totalSavings: number
  itemCount: number
}

export function CartSummary({ subtotal, originalTotal, totalSavings, itemCount }: CartSummaryProps) {
  const router = useRouter()
  // const shipping: number = 0 // Free shipping for now
  const total = subtotal

  const hasSavings = totalSavings > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items ({itemCount})</span>
          {hasSavings ? (
            <div className="text-right">
              <span className="line-through text-gray-400">৳{originalTotal.toFixed(2)}</span>
              <span className="ml-2 text-red-600 font-medium">৳{subtotal.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-medium">৳{subtotal.toFixed(2)}</span>
          )}
        </div>

        {hasSavings && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount Savings</span>
            <span className="font-medium text-green-600">-৳{totalSavings.toFixed(2)}</span>
          </div>
        )}
        
        {/* <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-green-600">
            {shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}
          </span>
        </div> */}

        <Separator />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>৳{total.toFixed(2)}</span>
        </div>

        {hasSavings && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-green-700 font-medium text-center">
              🎉 You're saving ৳{totalSavings.toFixed(2)} on this order!
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => router.push('/checkout')}
        >
          Proceed to Checkout
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push('/products')}
        >
          Continue Shopping
        </Button>
      </CardFooter>
    </Card>
  )
}