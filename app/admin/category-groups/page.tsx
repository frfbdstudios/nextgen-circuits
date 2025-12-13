'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'
import { useUser } from '@/hooks/use-user'
import { isAdmin } from '@/lib/supabase/role-access-control'
import { AddCategoryGroupDialog } from '../components/add-category-group-dialog'
import { CategoryGroupTable } from '../components/category-group-table'

export interface CategoryGroup {
  id: string
  name: string
  description: string
  category_ids: string[]
  created_at: string
  updated_at: string
}

export default function CategoryGroupsPage() {
  const supabase = getBrowserSupabaseClient()
  const { user } = useUser()
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    fetchCategoryGroups()
  }, [userIsAdmin, user])

  const checkAdminStatus = async () => {
    const adminStatus = await isAdmin(user)
    setUserIsAdmin(adminStatus)
    console.log('User is admin:', adminStatus)
  }

  const fetchCategoryGroups = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('category_groups')
        .select('*')
        .order('name')

      if (error) throw error
      setCategoryGroups(data || [])
    } catch (error: any) {
      console.error('Error fetching category groups:', error)
      toast.error('Failed to load category groups')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGroup = () => {
    if (!userIsAdmin) {
      toast.error('Only admins can add category groups')
      return
    }
    setIsAddDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Groups</h1>
            <p className="text-gray-600 mt-1">
              Organize multiple categories into groups for better management
            </p>
          </div>
          <Button
            onClick={handleAddGroup}
            className="gap-2 bg-[#3498db] hover:bg-[#2980b9]"
            disabled={!userIsAdmin || loading}
          >
            <Plus size={20} />
            Add Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Groups</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : categoryGroups.length}
                </p>
              </div>
              <div className="p-3 bg-[#3498db]/10 rounded-lg">
                <div className="w-8 h-8 text-[#3498db]">📁</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Groups</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : categoryGroups.length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="w-8 h-8 text-green-600">✓</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    categoryGroups.reduce((sum, group) => sum + (group.category_ids?.length || 0), 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <div className="w-8 h-8 text-purple-600">🏷️</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Groups Table */}
        <CategoryGroupTable
          categoryGroups={categoryGroups}
          loading={loading}
          onRefresh={fetchCategoryGroups}
        />

        {/* Add Category Group Dialog */}
        <AddCategoryGroupDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={() => {
            setIsAddDialogOpen(false)
            fetchCategoryGroups()
          }}
        />
      </div>
    </div>
  )
}
