'use client'

import { useState } from 'react'
import { X, Package, DollarSign, Layers, Box, Tag, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Product } from '../products/page'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ViewProductDialogProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function ViewProductDialog({ product, isOpen, onClose }: ViewProductDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = product.images || []
  const hasImages = images.length > 0

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "OUT OF STOCK", color: "bg-red-500" }
    if (stock < 50) return { label: "LOW STOCK", color: "bg-orange-500" }
    return { label: "IN STOCK", color: "bg-green-500" }
  }

  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const status = getStockStatus(product.stock)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Product Details</DialogTitle>
            <Badge className={`${status.color} text-white`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[80vh] p-6">


          <div className="space-y-6">
            {/* Product Image Gallery */}
            <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              {hasImages ? (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={previousImage}
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight size={24} />
                      </Button>

                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Package size={64} className="mx-auto mb-2" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${index === currentImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Name & SKU */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-500 mt-1">SKU: {product.sku}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <DollarSign size={18} />
                  <span className="text-sm font-medium">Price</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Box size={18} />
                  <span className="text-sm font-medium">Stock</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Layers size={18} />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCategory(product.category)}</p>
              </div>

              {/* <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Tag size={18} />
                  <span className="text-sm font-medium">Value</span>
                </div>
                <p className="text-lg font-bold text-gray-900">${(product.price * product.stock).toFixed(2)}</p>
              </div> */}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar size={20} className="text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created At</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(product.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar size={20} className="text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(product.updated_at)}</p>
                  </div>
                </div>

                {product.created_by && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
                    <User size={20} className="text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created By</p>
                      <p className="text-sm text-gray-900 mt-1 font-mono">{product.created_by}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Warning */}
            {product.stock < 50 && product.stock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Package size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900">Low Stock Alert</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      This product is running low on stock. Consider restocking soon.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Package size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Out of Stock</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This product is currently out of stock. Restock immediately to continue sales.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}