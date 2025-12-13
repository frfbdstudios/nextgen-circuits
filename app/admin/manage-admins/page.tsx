'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
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
import { toast } from 'sonner'
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Edit,
  Search,
  Loader2,
  User
} from 'lucide-react'
import { 
  adminManagementService, 
  type UserWithProfile, 
  type RestrictedUrl 
} from '@/lib/supabase/admin-management'
import { useUser } from '@/hooks/use-user'

export default function ManageAdminsPage() {
  const { user } = useUser()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [restrictedUrls, setRestrictedUrls] = useState<RestrictedUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  // URL form state
  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const [editingUrl, setEditingUrl] = useState<RestrictedUrl | null>(null)
  const [urlForm, setUrlForm] = useState({ url_pattern: '', description: '' })
  const [savingUrl, setSavingUrl] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [usersData, urlsData] = await Promise.all([
      adminManagementService.getUsers(),
      adminManagementService.getRestrictedUrls()
    ])
    setUsers(usersData)
    setRestrictedUrls(urlsData)
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'manager' | 'admin') => {
    // Prevent self-demotion
    if (userId === user?.id && newRole !== 'admin') {
      toast.error("You cannot change your own role")
      return
    }

    setUpdatingUserId(userId)
    const result = await adminManagementService.updateUserRole(userId, newRole)
    
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, profile: { ...u.profile!, role: newRole } }
          : u
      ))
      toast.success('User role updated successfully')
    } else {
      toast.error(result.error || 'Failed to update user role')
    }
    setUpdatingUserId(null)
  }

  const handleSaveUrl = async () => {
    if (!urlForm.url_pattern) {
      toast.error('URL pattern is required')
      return
    }

    // Ensure URL starts with /admin/
    if (!urlForm.url_pattern.startsWith('/admin/')) {
      toast.error('URL pattern must start with /admin/')
      return
    }

    setSavingUrl(true)
    
    const result = editingUrl
      ? await adminManagementService.updateRestrictedUrl(editingUrl.id, urlForm.url_pattern, urlForm.description)
      : await adminManagementService.addRestrictedUrl(urlForm.url_pattern, urlForm.description)

    if (result.success) {
      toast.success(editingUrl ? 'URL updated successfully' : 'URL added successfully')
      setShowUrlDialog(false)
      setEditingUrl(null)
      setUrlForm({ url_pattern: '', description: '' })
      loadData()
    } else {
      toast.error(result.error || 'Failed to save URL')
    }
    setSavingUrl(false)
  }

  const handleDeleteUrl = async (id: string) => {
    const result = await adminManagementService.deleteRestrictedUrl(id)
    
    if (result.success) {
      setRestrictedUrls(prev => prev.filter(url => url.id !== id))
      toast.success('URL restriction removed')
    } else {
      toast.error(result.error || 'Failed to delete URL')
    }
  }

  const openEditUrlDialog = (url: RestrictedUrl) => {
    setEditingUrl(url)
    setUrlForm({ url_pattern: url.url_pattern, description: url.description || '' })
    setShowUrlDialog(true)
  }

  const openAddUrlDialog = () => {
    setEditingUrl(null)
    setUrlForm({ url_pattern: '/admin/', description: '' })
    setShowUrlDialog(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600"><ShieldCheck className="w-3 h-3 mr-1" />Admin</Badge>
      case 'manager':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><ShieldAlert className="w-3 h-3 mr-1" />Manager</Badge>
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />User</Badge>
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || u.profile?.role === roleFilter
    
    return matchesSearch && matchesRole
  })

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
        <h1 className="text-3xl font-bold">User & Access Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and restrict manager access to specific pages
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="restrictions" className="gap-2">
            <LinkIcon className="w-4 h-4" />
            URL Restrictions
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Promote users to managers or admins. Admins have full access, managers have limited access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="manager">Managers</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {u.profile?.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {u.profile?.full_name || 'No name'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.email}
                            {u.id === user?.id && (
                              <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(u.profile?.role || 'user')}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.profile?.role || 'user'}
                              onValueChange={(value: 'user' | 'manager' | 'admin') => 
                                handleRoleChange(u.id, value)
                              }
                              disabled={updatingUserId === u.id || u.id === user?.id}
                            >
                              <SelectTrigger className="w-[140px]">
                                {updatingUserId === u.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Role Summary */}
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  {users.filter(u => u.profile?.role === 'admin').length} Admins
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert className="w-4 h-4 text-blue-500" />
                  {users.filter(u => u.profile?.role === 'manager').length} Managers
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {users.filter(u => u.profile?.role === 'user' || !u.profile?.role).length} Users
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL Restrictions Tab */}
        <TabsContent value="restrictions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manager URL Restrictions</CardTitle>
                <CardDescription>
                  Restrict managers from accessing specific admin pages. Admins always have full access.
                </CardDescription>
              </div>
              <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                <DialogTrigger asChild>
                  <Button onClick={openAddUrlDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Restriction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUrl ? 'Edit URL Restriction' : 'Add URL Restriction'}
                    </DialogTitle>
                    <DialogDescription>
                      Managers will be blocked from accessing this URL pattern.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="url_pattern">URL Pattern</Label>
                      <Input
                        id="url_pattern"
                        placeholder="/admin/manage-admins"
                        value={urlForm.url_pattern}
                        onChange={(e) => setUrlForm(prev => ({ ...prev, url_pattern: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must start with /admin/. Sub-paths will also be blocked (e.g., /admin/settings blocks /admin/settings/*)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Description of this restriction"
                        value={urlForm.description}
                        onChange={(e) => setUrlForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUrlDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveUrl} disabled={savingUrl}>
                      {savingUrl && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingUrl ? 'Update' : 'Add'} Restriction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {restrictedUrls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No URL restrictions configured</p>
                  <p className="text-sm">Add restrictions to limit manager access to specific pages</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL Pattern</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restrictedUrls.map((url) => (
                        <TableRow key={url.id}>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {url.url_pattern}
                            </code>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {url.description || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(url.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditUrlDialog(url)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete URL Restriction?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will allow managers to access <code className="bg-muted px-1 rounded">{url.url_pattern}</code>. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUrl(url.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Admins</strong> have full access to all pages</li>
                  <li>• <strong>Managers</strong> are blocked from URLs listed above</li>
                  <li>• <strong>Users</strong> cannot access any /admin pages</li>
                  <li>• URL patterns match exact paths and all sub-paths</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}