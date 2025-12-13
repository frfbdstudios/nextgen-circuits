'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { discountService, type Discount } from '@/lib/supabase/discounts'
import { toast } from 'sonner'
import DiscountForm from './components/discount-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)

  useEffect(() => {
    loadDiscounts()
  }, [])

  const loadDiscounts = async () => {
    setIsLoading(true)
    const data = await discountService.getDiscounts()
    setDiscounts(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return

    const result = await discountService.deleteDiscount(id)
    if (result.success) {
      toast.success('Discount deleted successfully')
      loadDiscounts()
    } else {
      toast.error(result.error || 'Failed to delete discount')
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await discountService.toggleDiscount(id, !currentStatus)
    if (result.success) {
      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadDiscounts()
    } else {
      toast.error(result.error || 'Failed to toggle discount')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isActive = (discount: Discount) => {
    if (!discount.is_active) return false
    const now = new Date()
    if (discount.start_date && new Date(discount.start_date) > now) return false
    if (discount.end_date && new Date(discount.end_date) < now) return false
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discounts</h1>
            <p className="text-gray-500 mt-1">Manage product and category discounts</p>
          </div>
          <Button onClick={() => {
            setEditingDiscount(null)
            setShowForm(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Discount
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading discounts...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No discounts found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Discount
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Apply To</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.name}
                      {discount.description && (
                        <p className="text-xs text-gray-500 mt-1">{discount.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {discount.discount_type === 'percentage' 
                        ? `${discount.discount_value}%` 
                        : `৳${discount.discount_value}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm capitalize">{discount.target_type}</span>
                        <span className="text-xs text-gray-500">{discount.target_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(discount.start_date)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(discount.end_date)}
                    </TableCell>
                    <TableCell>
                      {isActive(discount) ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(discount.id, discount.is_active)}
                        >
                          {discount.is_active ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingDiscount(discount)
                            setShowForm(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Discount Form Modal */}
      {showForm && (
        <DiscountForm
          editingDiscount={editingDiscount}
          onSuccess={() => {
            setShowForm(false)
            setEditingDiscount(null)
            loadDiscounts()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingDiscount(null)
          }}
        />
      )}
    </div>
  )
}