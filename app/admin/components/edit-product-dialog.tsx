'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, X, Upload } from 'lucide-react'
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
import { Product } from '../products/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'

interface EditProductDialogProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditProductDialog({ product, isOpen, onClose, onSuccess }: EditProductDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    sku: product.sku,
    isActive: product.is_active,
    buyingPrice: product.buyingPrice || 0,
  })

  const [existingImages, setExistingImages] = useState<string[]>(product.images || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Reset form when product changes
  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      isActive: product.is_active,
      buyingPrice: product.buyingPrice || 0,
    })
    setExistingImages(product.images || [])
    setNewImageFiles([])
    setNewImagePreviews([])
    setErrors({})
  }, [product])

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
    const newErrors: Partial<Record<string, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (!formData.category) newErrors.category = 'Category is required'
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
    if (formData.buyingPrice <= 0) newErrors.buyingPrice = 'Buying price must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + newImageFiles.length + files.length
    
    if (totalImages > 5) {
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
    
    setNewImageFiles(prev => [...prev, ...validFiles])
    setNewImagePreviews(prev => [...prev, ...newPreviews])
    setErrors(prev => ({ ...prev, images: undefined }))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const userIsAdmin = await isAdmin(user)
      if (!userIsAdmin) {
        toast.error("Only admins can edit products")
        return
      }

      // Upload new images
      const newImageUrls: string[] = []
      
      if (newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${formData.sku}-${Date.now()}-${i}.${fileExt}`
          const filePath = `products/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`)
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath)

          newImageUrls.push(publicUrl)
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls]

      // Delete removed images from storage
      const removedImages = (product.images || []).filter(img => !existingImages.includes(img))
      for (const url of removedImages) {
        const path = url.split('/').slice(-2).join('/')
        await supabase.storage.from('product-images').remove([path])
      }

      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          stock: formData.stock,
          sku: formData.sku,
          images: allImages,
          is_active: formData.isActive,
        })
        .eq('id', product.id)

      if (error) {
        // Clean up newly uploaded images if update fails
        for (const url of newImageUrls) {
          const path = url.split('/').slice(-2).join('/')
          await supabase.storage.from('product-images').remove([path])
        }
        throw error
      }

      // Check if buying price changed and insert new cost record
      if (formData.buyingPrice !== product.buyingPrice) {
        const { error: costError } = await supabase
          .from('product_costs')
          .insert({
            product_id: product.id,
            buying_price: formData.buyingPrice,
            notes: 'Price update',
            created_by: user?.id,
          })

        if (costError) {
          console.error('Error updating product cost:', costError)
          toast.error('Product updated but failed to save new buying price')
        }
      }

      toast.success('Product updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating product:', error)
      toast.error(error.message || 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'buyingPrice' ? parseFloat(value) || 0 : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const totalImages = existingImages.length + newImageFiles.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <ScrollArea className='h-[80vh] w-full'>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details
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
                <Label htmlFor="price">Selling Price ($) *</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
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
                  className={errors.stock ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
              </div>
            </div>

            {/* Buying Price & Profit Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyingPrice">Buying Price ($) *</Label>
                <Input
                  type="number"
                  id="buyingPrice"
                  name="buyingPrice"
                  value={formData.buyingPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={errors.buyingPrice ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.buyingPrice && <p className="text-red-500 text-sm">{errors.buyingPrice}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Profit Margin</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center justify-between">
                  <span className="text-sm">
                    {formData.price > 0 && formData.buyingPrice > 0
                      ? `${(((formData.price - formData.buyingPrice) / formData.buyingPrice) * 100).toFixed(2)}%`
                      : '0.00%'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ${(formData.price - formData.buyingPrice).toFixed(2)} profit
                  </span>
                </div>
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
                    disabled={isSubmitting || totalImages >= 5}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={isSubmitting || totalImages >= 5}
                    className="gap-2"
                  >
                    <Upload size={16} />
                    Upload Images ({totalImages}/5)
                  </Button>
                </div>

                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Existing Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
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
                  </div>
                )}

                {/* New Image Previews */}
                {newImagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">New Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            New
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
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