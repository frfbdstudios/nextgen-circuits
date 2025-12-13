'use client'

import { useState, useEffect } from 'react'
import { X, FolderOpen, Calendar, FileText, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CategoryGroup } from '../category-groups/page'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'

interface ViewCategoryGroupDialogProps {
  group: CategoryGroup
  isOpen: boolean
  onClose: () => void
}

interface Category {
  id: string
  name: string
  description: string
  created_at: string
}

export function ViewCategoryGroupDialog({ group, isOpen, onClose }: ViewCategoryGroupDialogProps) {
  const supabase = getBrowserSupabaseClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setIsLoading(true)
      try {
        if (group.category_ids && group.category_ids.length > 0) {
          // Fetch categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, description, created_at')
            .in('id', group.category_ids)
            .order('name')

          if (categoriesError) throw categoriesError
          setCategories(categoriesData || [])

          // Fetch product counts for each category
          const counts: Record<string, number> = {}
          for (const categoryId of group.category_ids) {
            const { count, error } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category', categoryId)

            if (!error) {
              counts[categoryId] = count || 0
            }
          }
          setProductCounts(counts)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchCategoriesAndProducts()
    }
  }, [group.category_ids, isOpen, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGroupIcon = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1, 4)
  }

  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-[#3498db] text-white flex items-center justify-center font-semibold">
              {getGroupIcon(group.name)}
            </div>
            <div>
              <div>{group.name}</div>
              <DialogDescription className="mt-1">
                Category group details and associated categories
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] w-full pr-4">
          <div className="space-y-6">
            {/* Group Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Group Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FileText size={16} />
                    <span className="text-sm font-medium">Description</span>
                  </div>
                  <p className="text-gray-900">{group.description}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <p className="text-gray-900">{formatDate(group.created_at)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FolderOpen size={16} />
                    <span className="text-sm font-medium">Total Categories</span>
                  </div>
                  <p className="text-2xl font-bold text-[#3498db]">{categories.length}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Package size={16} />
                    <span className="text-sm font-medium">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold text-[#3498db]">{totalProducts}</p>
                </div>
              </div>
            </div>

            {/* Categories in Group */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Categories in this Group</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No categories in this group</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3498db] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <Badge variant="secondary" className="bg-[#3498db]/10 text-[#3498db]">
                            {productCounts[category.id] || 0} products
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            {!isLoading && categories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Category Statistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">Most Products</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {Math.max(...Object.values(productCounts), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Avg per Category</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {categories.length > 0 ? Math.round(totalProducts / categories.length) : 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">Empty Categories</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {Object.values(productCounts).filter(count => count === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* <div className="flex justify-end pt-4 border-t">
          <Button type="button" onClick={onClose} className="gap-2">
            <X size={16} />
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  )
}