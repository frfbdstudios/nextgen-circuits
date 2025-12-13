'use client'

import { useState, useEffect } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Category } from '../categories/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'

interface DeleteCategoryDialogProps {
  category: Category
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteCategoryDialog({ category, isOpen, onClose, onSuccess }: DeleteCategoryDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)
  const [productCount, setProductCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductCount = async () => {
      setIsLoading(true)
      try {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.id)

        if (error) throw error
        setProductCount(count || 0)
      } catch (error) {
        console.error('Error fetching product count:', error)
        setProductCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchProductCount()
    }
  }, [category.id, isOpen, supabase])

  const handleDelete = async () => {
    if (productCount > 0) {
      toast.error('Cannot delete category with associated products')
      return
    }

    setIsDeleting(true)

    try {
      const userIsAdmin = await isAdmin(user)
      if (!userIsAdmin) {
        toast.error("Only admins can delete categories")
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      toast.success('Category deleted successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(error.message || 'Failed to delete category')
    } finally {
      setIsDeleting(false)
    }
  }

  const hasProducts = productCount > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Checking category...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{category.name}</span>?
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {category.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className={`font-medium ${hasProducts ? 'text-red-600' : 'text-green-600'}`}>
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                </div>
              </div>

              {hasProducts && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This category has {productCount} associated {productCount === 1 ? 'product' : 'products'}. 
                    Please reassign or delete {productCount === 1 ? 'it' : 'them'} before deleting this category.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting || isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={isDeleting || isLoading || hasProducts}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Category
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}