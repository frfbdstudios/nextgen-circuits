'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Star, 
  FolderOpen,
  Loader2,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Package,
  Layers
} from 'lucide-react'
import { 
  landingPageService, 
  type FeaturedProduct, 
  type PopularCategory 
} from '@/lib/supabase/landing-page'
import Image from 'next/image'

export default function LandingPageManagement() {
  // Featured Products State
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [allProducts, setAllProducts] = useState<{ id: string; name: string; price: number; images: string[]; sku: string }[]>([])
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  // Popular Categories State
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([])
  const [allCategories, setAllCategories] = useState<{ 
    id: string; 
    name: string; 
    description: string | null; 
    product_count: number; 
    first_image: string | null 
  }[]>([])
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [customImageUrl, setCustomImageUrl] = useState<string>('')

  // General State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [featured, categories, products, cats] = await Promise.all([
      landingPageService.getFeaturedProducts(),
      landingPageService.getPopularCategories(),
      landingPageService.getAllProducts(),
      landingPageService.getAllCategories()
    ])
    setFeaturedProducts(featured)
    setPopularCategories(categories)
    setAllProducts(products)
    setAllCategories(cats)
    setLoading(false)
  }

  // ==================== Featured Products Functions ====================

  const handleAddFeaturedProduct = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product')
      return
    }

    setSaving(true)
    const maxOrder = featuredProducts.length > 0 
      ? Math.max(...featuredProducts.map(p => p.display_order)) + 1 
      : 0

    const result = await landingPageService.addFeaturedProduct(selectedProductId, maxOrder)
    
    if (result.success) {
      toast.success('Product added to featured list')
      setShowProductDialog(false)
      setSelectedProductId('')
      loadData()
    } else {
      toast.error(result.error || 'Failed to add product')
    }
    setSaving(false)
  }

  const handleRemoveFeaturedProduct = async (id: string) => {
    const result = await landingPageService.removeFeaturedProduct(id)
    
    if (result.success) {
      setFeaturedProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product removed from featured list')
    } else {
      toast.error(result.error || 'Failed to remove product')
    }
  }

  const handleToggleFeaturedProduct = async (id: string, isActive: boolean) => {
    const result = await landingPageService.updateFeaturedProduct(id, { is_active: isActive })
    
    if (result.success) {
      setFeaturedProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_active: isActive } : p
      ))
      toast.success(isActive ? 'Product activated' : 'Product deactivated')
    } else {
      toast.error(result.error || 'Failed to update product')
    }
  }

  const handleMoveFeaturedProduct = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= featuredProducts.length) return

    const newProducts = [...featuredProducts]
    const temp = newProducts[index]
    newProducts[index] = newProducts[newIndex]
    newProducts[newIndex] = temp

    // Update display orders
    const updates = newProducts.map((p, i) => ({ id: p.id, display_order: i }))
    
    const result = await landingPageService.reorderFeaturedProducts(updates)
    
    if (result.success) {
      setFeaturedProducts(newProducts.map((p, i) => ({ ...p, display_order: i })))
      toast.success('Order updated')
    } else {
      toast.error(result.error || 'Failed to reorder')
    }
  }

  // ==================== Popular Categories Functions ====================

  const handleAddPopularCategory = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category')
      return
    }

    setSaving(true)
    const maxOrder = popularCategories.length > 0 
      ? Math.max(...popularCategories.map(c => c.display_order)) + 1 
      : 0

    const result = await landingPageService.addPopularCategory(
      selectedCategoryId, 
      maxOrder, 
      customImageUrl || undefined
    )
    
    if (result.success) {
      toast.success('Category added to popular list')
      setShowCategoryDialog(false)
      setSelectedCategoryId('')
      setCustomImageUrl('')
      loadData()
    } else {
      toast.error(result.error || 'Failed to add category')
    }
    setSaving(false)
  }

  const handleRemovePopularCategory = async (id: string) => {
    const result = await landingPageService.removePopularCategory(id)
    
    if (result.success) {
      setPopularCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Category removed from popular list')
    } else {
      toast.error(result.error || 'Failed to remove category')
    }
  }

  const handleTogglePopularCategory = async (id: string, isActive: boolean) => {
    const result = await landingPageService.updatePopularCategory(id, { is_active: isActive })
    
    if (result.success) {
      setPopularCategories(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: isActive } : c
      ))
      toast.success(isActive ? 'Category activated' : 'Category deactivated')
    } else {
      toast.error(result.error || 'Failed to update category')
    }
  }

  const handleMovePopularCategory = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= popularCategories.length) return

    const newCategories = [...popularCategories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[newIndex]
    newCategories[newIndex] = temp

    const updates = newCategories.map((c, i) => ({ id: c.id, display_order: i }))
    
    const result = await landingPageService.reorderPopularCategories(updates)
    
    if (result.success) {
      setPopularCategories(newCategories.map((c, i) => ({ ...c, display_order: i })))
      toast.success('Order updated')
    } else {
      toast.error(result.error || 'Failed to reorder')
    }
  }

  // Get available products (not already featured)
  const availableProducts = allProducts.filter(
    p => !featuredProducts.some(fp => fp.product_id === p.id)
  )

  // Get available categories (not already in popular)
  const availableCategories = allCategories.filter(
    c => !popularCategories.some(pc => pc.category_id === c.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Landing Page Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure featured products and popular categories shown on the homepage
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{featuredProducts.length}</p>
              <p className="text-muted-foreground">Featured Products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{popularCategories.length}</p>
              <p className="text-muted-foreground">Popular Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Featured Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="w-4 h-4" />
            Popular Categories
          </TabsTrigger>
        </TabsList>

        {/* Featured Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>
                  Products displayed prominently on the landing page. Drag to reorder.
                </CardDescription>
              </div>
              <Button onClick={() => setShowProductDialog(true)} disabled={availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              {featuredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No featured products yet</p>
                  <p className="text-sm">Add products to showcase them on the homepage</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Order</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {featuredProducts.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === 0}
                                onClick={() => handleMoveFeaturedProduct(index, 'up')}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === featuredProducts.length - 1}
                                onClick={() => handleMoveFeaturedProduct(index, 'down')}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] ? (
                                <Image
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium">{item.product?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.product?.sku}
                          </TableCell>
                          <TableCell>
                            ৳{item.product?.price?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={(checked) => handleToggleFeaturedProduct(item.id, checked)}
                              />
                              {item.is_active ? (
                                <Badge className="bg-green-500"><Eye className="w-3 h-3 mr-1" />Visible</Badge>
                              ) : (
                                <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Hidden</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Featured Product?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{item.product?.name}" from the featured products on the homepage.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveFeaturedProduct(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Popular Categories</CardTitle>
                <CardDescription>
                  Categories shown in the popular section on the landing page.
                </CardDescription>
              </div>
              <Button onClick={() => setShowCategoryDialog(true)} disabled={availableCategories.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {popularCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No popular categories yet</p>
                  <p className="text-sm">Add categories to showcase them on the homepage</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Order</TableHead>
                        <TableHead>Category</TableHead>
                        {/* <TableHead>Image</TableHead> */}
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularCategories.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === 0}
                                onClick={() => handleMovePopularCategory(index, 'up')}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === popularCategories.length - 1}
                                onClick={() => handleMovePopularCategory(index, 'down')}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{item.category?.name}</span>
                          </TableCell>
                          {/* <TableCell>
                            {item.category_image ? (
                              <Image
                                src={item.category_image}
                                alt={item.category?.name || ''}
                                width={48}
                                height={48}
                                className="rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={(checked) => handleTogglePopularCategory(item.id, checked)}
                              />
                              {item.is_active ? (
                                <Badge className="bg-green-500"><Eye className="w-3 h-3 mr-1" />Visible</Badge>
                              ) : (
                                <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" />Hidden</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Popular Category?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove "{item.category?.name}" from the popular categories on the homepage.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemovePopularCategory(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Featured Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Featured Product</DialogTitle>
            <DialogDescription>
              Select a product to feature on the landing page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>{product.name}</span>
                        <span className="text-muted-foreground">- ৳{product.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All products are already featured.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFeaturedProduct} disabled={saving || !selectedProductId}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Popular Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Popular Category</DialogTitle>
            <DialogDescription>
              Select a category to feature on the landing page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.first_image ? (
                          <Image
                            src={category.first_image}
                            alt={category.name}
                            width={24}
                            height={24}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                        )}
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All categories are already in the popular list.
                </p>
              )}
            </div>
            {/* <div className="space-y-2">
              <Label>Custom Image URL (Optional)</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the category's default image.
              </p>
            </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPopularCategory} disabled={saving || !selectedCategoryId}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}