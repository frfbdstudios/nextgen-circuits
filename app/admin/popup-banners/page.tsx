'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react'
import { popupBannerService, type PopupBanner } from '@/lib/supabase/popup-banners'
import { toast } from 'sonner'
import PopupBannerForm from './components/popup-banner-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default function PopupBannersPage() {
  const [banners, setBanners] = useState<PopupBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PopupBanner | null>(null)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    setIsLoading(true)
    const data = await popupBannerService.getBanners()
    setBanners(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this popup banner?')) return

    // Delete the image from storage first
    await popupBannerService.deleteBannerImage(imageUrl)

    const result = await popupBannerService.deleteBanner(id)
    if (result.success) {
      toast.success('Popup banner deleted successfully')
      loadBanners()
    } else {
      toast.error(result.error || 'Failed to delete popup banner')
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await popupBannerService.toggleBanner(id, !currentStatus)
    if (result.success) {
      toast.success(`Popup banner ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadBanners()
    } else {
      toast.error(result.error || 'Failed to toggle popup banner')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Popup Banners</h1>
            <p className="text-gray-500 mt-1">Manage promotional popup banners for landing page</p>
          </div>
          <Button onClick={() => {
            setEditingBanner(null)
            setShowForm(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {/* Active Banners Count */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{banners.filter(b => b.is_active).length}</span> active banner(s) will be shown on the landing page
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading popup banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No popup banners found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Display Order</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                        <Image
                          src={banner.image_url}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.display_order}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(banner.created_at)}
                    </TableCell>
                    <TableCell>
                      {banner.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggle(banner.id, banner.is_active)}
                        >
                          {banner.is_active ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingBanner(banner)
                            setShowForm(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(banner.id, banner.image_url)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Popup Banner Form Modal */}
      {showForm && (
        <PopupBannerForm
          editingBanner={editingBanner}
          onSuccess={() => {
            setShowForm(false)
            setEditingBanner(null)
            loadBanners()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingBanner(null)
          }}
        />
      )}
    </div>
  )
}