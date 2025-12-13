// 'use client'

// import { useEffect, useState } from 'react'
// import { User } from '@supabase/supabase-js'
// import { supabase } from './supabase-client'

// export interface UserProfile {
//   id: string
//   email: string
//   full_name: string | null
//   avatar_url: string | null
//   role: 'user' | 'admin' | 'moderator'
//   created_at: string
//   updated_at: string
// }

// export function useAuth() {
//   const [user, setUser] = useState<User | null>(null)
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [loading, setLoading] = useState(true)

//   const fetchProfile = async (userId: string) => {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if (error) {
//         console.error('Error fetching profile:', error)
//         return null
//       }

//       return data
//     } catch (error) {
//       console.error('Unexpected error fetching profile:', error)
//       return null
//     }
//   }

//   useEffect(() => {
//     let mounted = true

//     // Get initial user with token validation
//     const initializeAuth = async () => {
//       try {
//         const { data: { user }, error } = await supabase.auth.getUser()
        
//         if (!mounted) return

//         if (error) {
//           console.error('Error getting user:', error)
//           setUser(null)
//           setProfile(null)
//           return
//         }

//         setUser(user)
        
//         if (user) {
//           const userProfile = await fetchProfile(user.id)
//           if (mounted) {
//             setProfile(userProfile)
//           }
//         }
//       } catch (error) {
//         console.error('Unexpected error in auth initialization:', error)
//         if (mounted) {
//           setUser(null)
//           setProfile(null)
//         }
//       } finally {
//         if (mounted) {
//           setLoading(false)
//         }
//       }
//     }

//     initializeAuth()

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       if (!mounted) return

//       setUser(session?.user ?? null)
      
//       if (session?.user) {
//         const userProfile = await fetchProfile(session.user.id)
//         if (mounted) {
//           setProfile(userProfile)
//         }
//       } else {
//         if (mounted) {
//           setProfile(null)
//         }
//       }
//     })

//     return () => {
//       mounted = false
//       subscription.unsubscribe()
//     }
//   }, [])

//   return { user, profile, loading }
// }