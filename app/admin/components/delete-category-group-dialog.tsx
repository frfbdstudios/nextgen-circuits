'use client'

import { useState } from 'react'
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
import { CategoryGroup } from '../category-groups/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'

interface DeleteCategoryGroupDialogProps {
  group: CategoryGroup
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteCategoryGroupDialog({ group, isOpen, onClose, onSuccess }: DeleteCategoryGroupDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const userIsAdmin = await isAdmin(user)
      if (!userIsAdmin) {
        toast.error('Only admins can delete category groups')
        return
      }

      const { error } = await supabase
        .from('category_groups')
        .delete()
        .eq('id', group.id)

      if (error) throw error

      toast.success('Category group deleted successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error deleting category group:', error)
      toast.error(error.message || 'Failed to delete category group')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Category Group</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{group.name}</span>?
          </p>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {group.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium text-[#3498db]">
                  {group.category_ids?.length || 0} {group.category_ids?.length === 1 ? 'category' : 'categories'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Deleting this group will not delete the individual categories. 
              They will remain in the system.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}