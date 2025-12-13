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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CategoryGroup } from '../category-groups/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'

interface EditCategoryGroupDialogProps {
  group: CategoryGroup
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Category {
  id: string
  name: string
  description: string
}

export function EditCategoryGroupDialog({ group, isOpen, onClose, onSuccess }: EditCategoryGroupDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    category_ids: group.category_ids || [],
  })
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  // Reset form when group changes
  useEffect(() => {
    setFormData({
      name: group.name,
      description: group.description,
      category_ids: group.category_ids || [],
    })
    setErrors({})
  }, [group])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<string, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.category_ids.length === 0) {
      newErrors.categories = 'Please select at least one category'
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
        toast.error('Only admins can edit category groups')
        return
      }

      const { error } = await supabase
        .from('category_groups')
        .update({
          name: formData.name,
          description: formData.description,
          category_ids: formData.category_ids,
        })
        .eq('id', group.id)

      if (error) throw error

      toast.success('Category group updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating category group:', error)
      toast.error(error.message || 'Failed to update category group')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Category Group</DialogTitle>
          <DialogDescription>
            Update the category group details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Electronics Components"
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
                  rows={3}
                  placeholder="Enter group description..."
                  className={errors.description ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              {/* Categories Selection */}
              <div className="space-y-2">
                <Label>Select Categories *</Label>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No categories available</p>
                  </div>
                ) : (
                  <div className="space-y-2 border rounded-lg p-4 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`edit-${category.id}`}
                          checked={formData.category_ids.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                          disabled={isSubmitting}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`edit-${category.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {category.name}
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.categories && <p className="text-red-500 text-sm">{errors.categories}</p>}
                <p className="text-sm text-gray-500">
                  {formData.category_ids.length} {formData.category_ids.length === 1 ? 'category' : 'categories'} selected
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-[#3498db] hover:bg-[#2980b9]"
              disabled={isSubmitting || loadingCategories}
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