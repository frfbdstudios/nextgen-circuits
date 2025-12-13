'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CategoryGroup } from '../category-groups/page'
import { EditCategoryGroupDialog } from './edit-category-group-dialog'
import { DeleteCategoryGroupDialog } from './delete-category-group-dialog'
import { ViewCategoryGroupDialog } from './view-category-group-dialog'

interface CategoryGroupTableProps {
  categoryGroups: CategoryGroup[]
  loading: boolean
  onRefresh: () => void
}

export function CategoryGroupTable({ categoryGroups, loading, onRefresh }: CategoryGroupTableProps) {
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<CategoryGroup | null>(null)
  const [viewingGroup, setViewingGroup] = useState<CategoryGroup | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGroupIcon = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1, 4)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498db]"></div>
          <span className="ml-3 text-gray-600">Loading category groups...</span>
        </div>
      </div>
    )
  }

  if (categoryGroups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No category groups found</p>
          <p className="text-sm mt-1">Create your first category group to get started</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Group Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Categories</TableHead>
              <TableHead className="font-semibold text-gray-700">Created Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryGroups.map((group) => (
              <TableRow key={group.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#3498db] text-white flex items-center justify-center font-semibold text-xs">
                      {getGroupIcon(group.name)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{group.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{group.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 font-medium">
                  {group.category_ids?.length || 0} categories
                </TableCell>
                <TableCell className="text-gray-700">{formatDate(group.created_at)}</TableCell>
                <TableCell>
                  <Badge className="bg-green-500 text-white">ACTIVE</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                      aria-label="View group"
                      onClick={() => setViewingGroup(group)}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                      aria-label="Edit group"
                      onClick={() => setEditingGroup(group)}
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    <button
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      aria-label="Delete group"
                      onClick={() => setDeletingGroup(group)}
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      {viewingGroup && (
        <ViewCategoryGroupDialog
          group={viewingGroup}
          isOpen={!!viewingGroup}
          onClose={() => setViewingGroup(null)}
        />
      )}

      {/* Edit Dialog */}
      {editingGroup && (
        <EditCategoryGroupDialog
          group={editingGroup}
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          onSuccess={() => {
            setEditingGroup(null)
            onRefresh()
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingGroup && (
        <DeleteCategoryGroupDialog
          group={deletingGroup}
          isOpen={!!deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onSuccess={() => {
            setDeletingGroup(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}