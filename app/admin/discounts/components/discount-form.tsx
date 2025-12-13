'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { discountService, type CreateDiscountData } from '@/lib/supabase/discounts'
import { toast } from 'sonner'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'

interface DiscountFormProps {
  onSuccess: () => void
  onCancel: () => void
  editingDiscount?: any
}

export default function DiscountForm({ onSuccess, onCancel, editingDiscount }: DiscountFormProps) {
  const [formData, setFormData] = useState<CreateDiscountData>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    target_type: 'product',
    target_id: '',
    is_active: true,
    start_date: '',
    end_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    loadData()
    if (editingDiscount) {
      setFormData({
        name: editingDiscount.name,
        description: editingDiscount.description || '',
        discount_type: editingDiscount.discount_type,
        discount_value: editingDiscount.discount_value,
        target_type: editingDiscount.target_type,
        target_id: editingDiscount.target_id,
        is_active: editingDiscount.is_active,
        start_date: editingDiscount.start_date ? formatDateForInput(editingDiscount.start_date) : '',
        end_date: editingDiscount.end_date ? formatDateForInput(editingDiscount.end_date) : ''
      })
    }
  }, [editingDiscount])

  // Convert UTC timestamp to local datetime-local input format
  const formatDateForInput = (utcDate: string) => {
    const date = new Date(utcDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Convert local datetime-local input to UTC ISO string
  const formatDateForDatabase = (localDate: string | undefined) => {
    if (!localDate) return undefined
    const date = new Date(localDate)
    return date.toISOString()
  }

  const loadData = async () => {
    const supabase = getBrowserSupabaseClient()
    
    const [productsData, categoriesData] = await Promise.all([
      supabase.from('products').select('id, name, sku').order('name'),
      supabase.from('categories').select('id, name').order('name')
    ])

    if (productsData.data) setProducts(productsData.data)
    if (categoriesData.data) setCategories(categoriesData.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData: CreateDiscountData = {
        name: formData.name,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        target_type: formData.target_type,
        target_id: formData.target_id,
        is_active: formData.is_active,
        start_date: formatDateForDatabase(formData.start_date),
        end_date: formatDateForDatabase(formData.end_date)
      }

      console.log('Submitting discount with dates:', {
        start_date_input: formData.start_date,
        start_date_utc: submitData.start_date,
        end_date_input: formData.end_date,
        end_date_utc: submitData.end_date
      })

      const result = editingDiscount
        ? await discountService.updateDiscount(editingDiscount.id, submitData)
        : await discountService.createDiscount(submitData)

      if (result.success) {
        toast.success(editingDiscount ? 'Discount updated successfully' : 'Discount created successfully')
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to save discount')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">
              {editingDiscount ? 'Edit Discount' : 'Create Discount'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Discount Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">
                  Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(৳)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_type">Apply To *</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(value: 'product' | 'category') => 
                    setFormData({ ...formData, target_type: value, target_id: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Specific Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_id">
                  {formData.target_type === 'product' ? 'Select Product *' : 'Select Category *'}
                </Label>
                <Select
                  value={formData.target_id}
                  onValueChange={(value) => setFormData({ ...formData, target_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${formData.target_type}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.target_type === 'product' ? (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date (Optional)</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for immediate activation</p>
              </div>

              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : editingDiscount ? 'Update Discount' : 'Create Discount'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}