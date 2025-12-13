'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
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
import { Category } from '../categories/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'

interface EditCategoryDialogProps {
  category: Category
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditCategoryDialog({ category, isOpen, onClose, onSuccess }: EditCategoryDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  // Reset form when category changes
  useEffect(() => {
    setFormData({
      name: category.name,
      description: category.description,
    })
    setErrors({})
  }, [category])

  const validateForm = () => {
    const newErrors: Partial<Record<string, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const userIsAdmin = await isAdmin(user)
      if (!userIsAdmin) {
        toast.error("Only admins can edit categories")
        return
      }

      // Update category
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description,
        })
        .eq('id', category.id)

      if (error) {
        throw error
      }

      toast.success('Category updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating category:', error)
      toast.error(error.message || 'Failed to update category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Microcontrollers"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
              placeholder="Enter category description..."
              className={errors.description ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
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
      </DialogContent>
    </Dialog>
  )
}