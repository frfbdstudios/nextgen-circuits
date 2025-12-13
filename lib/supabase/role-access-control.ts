import type { User } from "@supabase/supabase-js"
import { getBrowserSupabaseClient } from "./browser"

const supabase = getBrowserSupabaseClient()

const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    }
  }

export const hasRole = async (user: User | null, roles: string[]) => {
  if (!user) return false
  const data = await fetchProfile(user.id)
  if (!data || !data.role) return false
  return roles.includes(data.role)
}

export const isAdmin = async (user: User | null) => {
  return await hasRole(user, ['admin'])
}

export const isManager = async (user: User | null) => {
  return await hasRole(user, ['manager'])
}