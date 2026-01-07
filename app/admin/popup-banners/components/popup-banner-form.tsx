'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Upload, Loader2 } from 'lucide-react'
import { popupBannerService, type PopupBanner } from '@/lib/supabase/popup-banners'
import { toast } from 'sonner'
import Image from 'next/image'

interface PopupBannerFormProps {
  editingBanner: PopupBanner | null
  onSuccess: () => void
  onCancel: () => void
}

export default function PopupBannerForm({ editingBanner, onSuccess, onCancel }: PopupBannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(editingBanner?.title || '')
  const [displayOrder, setDisplayOrder] = useState(editingBanner?.display_order || 0)
  const [isActive, setIsActive] = useState(editingBanner?.is_active || false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editingBanner?.image_url || null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(editingBanner?.image_url || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!editingBanner && !imageFile) {
      toast.error('Please select an image')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl = existingImageUrl

      // Upload new image if selected
      if (imageFile) {
        const uploadResult = await popupBannerService.uploadBannerImage(imageFile)
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }

        imageUrl = uploadResult.url!

        // Delete old image if updating
        if (editingBanner && existingImageUrl) {
          await popupBannerService.deleteBannerImage(existingImageUrl)
        }
      }

      if (!imageUrl) {
        throw new Error('No image URL available')
      }

      if (editingBanner) {
        // Update existing banner
        const result = await popupBannerService.updateBanner(editingBanner.id, {
          title,
          image_url: imageUrl,
          display_order: displayOrder,
          is_active: isActive,
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to update banner')
        }

        toast.success('Popup banner updated successfully')
      } else {
        // Create new banner
        const result = await popupBannerService.createBanner({
          title,
          image_url: imageUrl,
          display_order: displayOrder,
          is_active: isActive,
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to create banner')
        }

        toast.success('Popup banner created successfully')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error saving popup banner:', error)
      toast.error(error.message || 'Failed to save popup banner')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingBanner ? 'Edit' : 'Add'} Popup Banner
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter banner title"
                disabled={isSubmitting}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">Lower numbers appear first</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Banner Image {!editingBanner && '*'}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      disabled={isSubmitting}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">Upload an image</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Show this banner on the landing page
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingBanner ? 'Update Banner' : 'Create Banner'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}