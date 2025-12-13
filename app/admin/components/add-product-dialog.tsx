'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, X, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'

interface AddProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: ProductFormData, imageFiles: File[]) => void
  isSubmitting?: boolean
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  isActive?: boolean
}

export function AddProductDialog({ isOpen, onClose, onSubmit, isSubmitting = false }: AddProductDialogProps) {
  const supabase = getBrowserSupabaseClient()
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    sku: '',
    isActive: true,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData | 'images', string>>>({})
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name')
      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data || [])
      }
    }
    fetchCategories()
  }, [])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormData | 'images', string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData, imageFiles)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      sku: '',
      isActive: true,
    })
    setImageFiles([])
    setImagePreviews([])
    setErrors({})
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }))
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + imageFiles.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }))
      return
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isUnder5MB = file.size <= 5 * 1024 * 1024 // 5MB limit
      return isImage && isUnder5MB
    })

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, images: 'Only images under 5MB are allowed' }))
      return
    }

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    
    setImageFiles(prev => [...prev, ...validFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
    setErrors(prev => ({ ...prev, images: undefined }))
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <ScrollArea className='h-[80vh] w-full'>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 px-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Arduino Uno R3"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* SKU & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., ARD-UNO-R3"
                  className={errors.sku ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }))
                    if (errors.category) {
                      setErrors(prev => ({ ...prev, category: undefined }))
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter product description..."
                className={errors.description ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Active Status Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                }}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Product is active and available for sale
              </Label>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Product Images (Max 5)</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmitting || imageFiles.length >= 5}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={isSubmitting || imageFiles.length >= 5}
                    className="gap-2"
                  >
                    <Upload size={16} />
                    Upload Images ({imageFiles.length}/5)
                  </Button>
                </div>

                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gap-2 bg-[#3498db] hover:bg-[#2980b9]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}