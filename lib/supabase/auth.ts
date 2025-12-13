// 'use client'

// import { supabase } from "./supabase-client";

// export async function login() {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: {
//       redirectTo: `${window.location.origin}/auth/callback`,
//     }
//   })

//   if (error) {
//     console.error('Error logging in:', error)
//     throw error
//   }
  
//   return data
// }

// export async function logout() {
//   const { error } = await supabase.auth.signOut()
  
//   if (error) {
//     console.error('Error logging out:', error)
//     throw error
//   }
  
//   // Redirect to home after logout
//   window.location.href = '/'
// }


"use client"

import { getBrowserSupabaseClient } from "@/lib/supabase/browser"
import type { User } from "@supabase/supabase-js"

export async function login() {
  const supabase = getBrowserSupabaseClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { error }
}


export async function logout() {
  const supabase = getBrowserSupabaseClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}



async function ensureProfile(user: User) {
  const supabase = getBrowserSupabaseClient()
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  // If no profile, create one
  if (!existingProfile) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: 'user'
      })

    if (error) {
      console.error('Error creating profile:', error)
    }
  }
}
