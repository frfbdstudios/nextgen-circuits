'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Wallet, Banknote, AlertCircle, Truck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createOrder, calculateDeliveryFeePreview } from '@/lib/actions/checkout'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'

interface CheckoutFormProps {
  items: any[]
  total: number
  onDeliveryFeeChange?: (fee: number | null) => void
}

export function CheckoutForm({ items, total, onDeliveryFeeChange }: CheckoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod')
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_phone: '',
    recipient_secondary_phone: '',
    recipient_address: '',
    special_instruction: '',
    // Payment fields
    bkash_number: '',
    bkash_transaction_id: '',
    nagad_number: '',
    nagad_transaction_id: '',
  })

  // Load delivery details on mount
  useEffect(() => {
    const loadDeliveryDetails = async () => {
      try {
        const supabase = getBrowserSupabaseClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoadingDetails(false)
          return
        }

        const { data, error } = await supabase
          .from('delivery_details')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single()

        if (data && !error) {
          setFormData(prev => ({
            ...prev,
            recipient_name: data.recipient_name || '',
            recipient_phone: data.recipient_phone || '',
            recipient_secondary_phone: data.recipient_secondary_phone || '',
            recipient_address: data.recipient_address || '',
            special_instruction: data.special_instruction || '',
          }))
          toast.success('Delivery details loaded')
        }
      } catch (error) {
        console.error('Error loading delivery details:', error)
      } finally {
        setLoadingDetails(false)
      }
    }

    loadDeliveryDetails()
  }, [])

  // Calculate delivery fee when address changes
  useEffect(() => {
    const calculateFee = async () => {
      if (formData.recipient_address.length >= 10) {
        const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        const fee = await calculateDeliveryFeePreview(formData.recipient_address, totalQuantity)
        setDeliveryFee(fee)
        onDeliveryFeeChange?.(fee)
      } else {
        setDeliveryFee(null)
        onDeliveryFeeChange?.(null)
      }
    }
    
    const debounce = setTimeout(calculateFee, 500)
    return () => clearTimeout(debounce)
  }, [formData.recipient_address, items.length, onDeliveryFeeChange])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate payment method specific fields
      if (paymentMethod === 'bkash') {
        if (!formData.bkash_number || !formData.bkash_transaction_id) {
          toast.error('Please provide bKash number and transaction ID')
          setLoading(false)
          return
        }
      }

      if (paymentMethod === 'nagad') {
        if (!formData.nagad_number || !formData.nagad_transaction_id) {
          toast.error('Please provide Nagad number and transaction ID')
          setLoading(false)
          return
        }
      }

      const orderData = {
        ...formData,
        payment_method: paymentMethod,
        items,
        total,
      }

      const result = await createOrder(orderData)

      if (result.success) {
        toast.success('Order placed successfully!')
        router.push('/user/orders')
      } else {
        toast.error(result.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalWeight = items.length * 0.05 // 50g per item
  const finalTotal = deliveryFee ? total + deliveryFee : total

  if (loadingDetails) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <div className="animate-pulse">Loading delivery details...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
          <CardDescription>Enter your delivery details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipient_name">Full Name *</Label>
            <Input
              id="recipient_name"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient_phone">Phone Number *</Label>
              <Input
                id="recipient_phone"
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                required
                pattern="^01[0-9]{9}$"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground mt-1">
                11 digit mobile number
              </p>
            </div>

            <div>
              <Label htmlFor="recipient_secondary_phone">
                Secondary Phone (Optional)
              </Label>
              <Input
                id="recipient_secondary_phone"
                name="recipient_secondary_phone"
                value={formData.recipient_secondary_phone}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                pattern="^01[0-9]{9}$"
                maxLength={11}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="recipient_address">Delivery Address *</Label>
            <Textarea
              id="recipient_address"
              name="recipient_address"
              value={formData.recipient_address}
              onChange={handleInputChange}
              placeholder="House/Flat, Road, Area, City, Postal Code"
              required
              minLength={10}
              maxLength={220}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Please provide complete address (10-220 characters)
            </p>
          </div>

          {/* Delivery Fee Preview */}
          {/* {deliveryFee !== null && (
            <Alert>
              <Truck className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estimated Delivery Fee</p>
                    <p className="text-sm text-muted-foreground">
                      Total weight: {totalWeight.toFixed(2)} kg
                    </p>
                  </div>
                  <p className="text-lg font-bold">৳{deliveryFee}</p>
                </div>
              </AlertDescription>
            </Alert>
          )} */}

          <div>
            <Label htmlFor="special_instruction">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="special_instruction"
              name="special_instruction"
              value={formData.special_instruction}
              onChange={handleInputChange}
              placeholder="Any special delivery instructions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: any) => setPaymentMethod(value)}
            className="space-y-3"
          >
            {/* Cash on Delivery */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                <Banknote className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-muted-foreground">
                    Pay when you receive your order
                  </div>
                </div>
              </Label>
            </div>

            {/* bKash */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="bkash" id="bkash" />
              <Label htmlFor="bkash" className="flex items-center gap-3 cursor-pointer flex-1">
                <Wallet className="h-5 w-5 text-pink-600" />
                <div>
                  <div className="font-medium">bKash</div>
                  <div className="text-sm text-muted-foreground">
                    Pay via bKash Mobile Banking
                  </div>
                </div>
              </Label>
            </div>

            {/* Nagad */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
              <RadioGroupItem value="nagad" id="nagad" />
              <Label htmlFor="nagad" className="flex items-center gap-3 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Nagad</div>
                  <div className="text-sm text-muted-foreground">
                    Pay via Nagad Mobile Banking
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* bKash Payment Instructions */}
          {paymentMethod === 'bkash' && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">bKash Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Open your bKash app</li>
                      <li>Go to "Send Money"</li>
                      <li>Send ৳{finalTotal.toFixed(2)} to: <strong>01XXXXXXXXX</strong></li>
                      <li>Enter your bKash account number and Transaction ID below</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="bkash_number">Your bKash Number *</Label>
                  <Input
                    id="bkash_number"
                    name="bkash_number"
                    value={formData.bkash_number}
                    onChange={handleInputChange}
                    placeholder="017XXXXXXXX"
                    required={paymentMethod === 'bkash'}
                    pattern="^01[0-9]{9}$"
                    maxLength={11}
                  />
                </div>

                <div>
                  <Label htmlFor="bkash_transaction_id">Transaction ID *</Label>
                  <Input
                    id="bkash_transaction_id"
                    name="bkash_transaction_id"
                    value={formData.bkash_transaction_id}
                    onChange={handleInputChange}
                    placeholder="Enter bKash transaction ID"
                    required={paymentMethod === 'bkash'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nagad Payment Instructions */}
          {paymentMethod === 'nagad' && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Nagad Payment Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Open your Nagad app</li>
                      <li>Go to "Send Money"</li>
                      <li>Send ৳{finalTotal.toFixed(2)} to: <strong>01XXXXXXXXX</strong></li>
                      <li>Enter your Nagad account number and Transaction ID below</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="nagad_number">Your Nagad Number *</Label>
                  <Input
                    id="nagad_number"
                    name="nagad_number"
                    value={formData.nagad_number}
                    onChange={handleInputChange}
                    placeholder="017XXXXXXXX"
                    required={paymentMethod === 'nagad'}
                    pattern="^01[0-9]{9}$"
                    maxLength={11}
                  />
                </div>

                <div>
                  <Label htmlFor="nagad_transaction_id">Transaction ID *</Label>
                  <Input
                    id="nagad_transaction_id"
                    name="nagad_transaction_id"
                    value={formData.nagad_transaction_id}
                    onChange={handleInputChange}
                    placeholder="Enter Nagad transaction ID"
                    required={paymentMethod === 'nagad'}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Back to Cart
        </Button>
        <Button type="submit" disabled={loading || loadingDetails} size="lg">
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </form>
  )
}