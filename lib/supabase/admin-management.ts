import { getBrowserSupabaseClient } from './browser'

export interface UserWithProfile {
  id: string
  email: string
  created_at: string
  profile: {
    full_name: string | null
    role: 'user' | 'manager' | 'admin'
    avatar_url: string | null
  } | null
}

export interface RestrictedUrl {
  id: string
  url_pattern: string
  description: string | null
  created_at: string
  updated_at: string
}

export const adminManagementService = {
  // Get all users with their profiles
  async getUsers(): Promise<UserWithProfile[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, created_at, email')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return (data || []).map((profile: { id: any; email: any; created_at: any; full_name: any; role: any; avatar_url: any }) => ({
      id: profile.id,
      email: profile.email || '',
      created_at: profile.created_at,
      profile: {
        full_name: profile.full_name,
        role: profile.role || 'user',
        avatar_url: profile.avatar_url
      }
    }))
  },

  // Update user role
  async updateUserRole(userId: string, role: 'user' | 'manager' | 'admin'): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  // Get all restricted URLs
  async getRestrictedUrls(): Promise<RestrictedUrl[]> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('restricted_urls')
      .select('*')
      .order('url_pattern', { ascending: true })

    if (error) {
      console.error('Error fetching restricted URLs:', error)
      return []
    }

    return data || []
  },

  // Add restricted URL
  async addRestrictedUrl(urlPattern: string, description?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('restricted_urls')
      .insert({ url_pattern: urlPattern, description })

    if (error) {
      console.error('Error adding restricted URL:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  // Update restricted URL
  async updateRestrictedUrl(id: string, urlPattern: string, description?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('restricted_urls')
      .update({ 
        url_pattern: urlPattern, 
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating restricted URL:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  // Delete restricted URL
  async deleteRestrictedUrl(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getBrowserSupabaseClient()

    const { error } = await supabase
      .from('restricted_urls')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting restricted URL:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  // Check if a URL is restricted for managers
  async isUrlRestricted(url: string): Promise<boolean> {
    const supabase = getBrowserSupabaseClient()
    
    const { data, error } = await supabase
      .from('restricted_urls')
      .select('url_pattern')

    if (error || !data) {
      return false
    }

    // Check if any pattern matches the URL
    return data.some((item: { url_pattern: any }) => {
      const pattern = item.url_pattern
      // Exact match or pattern match (e.g., /admin/settings matches /admin/settings/*)
      return url === pattern || url.startsWith(pattern + '/')
    })
  }
}