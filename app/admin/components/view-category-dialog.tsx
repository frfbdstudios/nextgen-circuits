'use client'

import { useState, useEffect } from 'react'
import { X, Package, Calendar, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Category } from '../categories/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'

interface ViewCategoryDialogProps {
  category: Category
  isOpen: boolean
  onClose: () => void
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  is_active: boolean
}

export function ViewCategoryDialog({ category, isOpen, onClose }: ViewCategoryDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, price, stock, is_active')
          .eq('category', category.id)
          .order('name')

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [category.id, isOpen, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryIcon = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1, 4)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-[#3498db] text-white flex items-center justify-center font-semibold">
              {getCategoryIcon(category.name)}
            </div>
            <div>
              <div>{category.name}</div>
              <DialogDescription className="mt-1">
                Category details and associated products
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] w-full pr-4">
          <div className="space-y-6">
            {/* Category Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FileText size={16} />
                    <span className="text-sm font-medium">Description</span>
                  </div>
                  <p className="text-gray-900">{category.description}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <p className="text-gray-900">{formatDate(category.created_at)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Package size={16} />
                    <span className="text-sm font-medium">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold text-[#3498db]">{products.length}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                </div>
              </div>
            </div>

            {/* Associated Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Associated Products</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No products in this category</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3498db] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <Badge
                            variant={product.is_active ? 'default' : 'secondary'}
                            className={product.is_active ? 'bg-green-500' : 'bg-gray-400'}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* <div className="flex justify-end pt-4 border-t">
          <Button type="button" onClick={onClose} className="gap-2">
            <X size={16} />
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  )
}