// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase/supabase-client'

// export default function AuthCallback() {
//   const router = useRouter()
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const handleCallback = async () => {
//       try {
//         // Supabase automatically handles the hash fragment from OAuth
//         const { data: { session }, error } = await supabase.auth.getSession()
        
//         if (error) {
//           console.error('Error getting session:', error)
//           setError(error.message)
//           router.push('/login')
//           return
//         }

//         if (session?.user) {
//           // Ensure profile exists
//           await ensureProfile(session.user)
          
//           // Redirect to user dashboard
//           router.push('/user')
//         } else {
//           console.error('No session found')
//           router.push('/login')
//         }
//       } catch (err) {
//         console.error('Unexpected error in auth callback:', err)
//         setError('An unexpected error occurred')
//         router.push('/login')
//       }
//     }

//     // Add a small delay to ensure the hash fragment is available
//     const timeout = setTimeout(() => {
//       handleCallback()
//     }, 100)

//     return () => clearTimeout(timeout)
//   }, [router])

//   async function ensureProfile(user: any) {
//     try {
//       // Check if profile exists
//       const { data: existingProfile } = await supabase
//         .from('profiles')
//         .select('id')
//         .eq('id', user.id)
//         .single()

//       // If no profile, create one
//       if (!existingProfile) {
//         const { error } = await supabase
//           .from('profiles')
//           .insert({
//             id: user.id,
//             email: user.email,
//             full_name: user.user_metadata?.full_name || null,
//             avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
//             role: 'user'
//           })

//         if (error) {
//           console.error('Error creating profile:', error)
//         }
//       }
//     } catch (error) {
//       console.error('Error in ensureProfile:', error)
//     }
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen gap-4">
//         <p className="text-red-500">Authentication failed: {error}</p>
//         <button 
//           onClick={() => router.push('/login')}
//           className="px-4 py-2 bg-blue-500 text-white rounded-lg"
//         >
//           Back to Login
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//         <p>Completing authentication...</p>
//       </div>
//     </div>
//   )
// }



import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Handle auth errors
  if (error) {
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  // Exchange code for session
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, request.url))
    }

    // Redirect to dashboard on successful authentication
    return NextResponse.redirect(new URL("/user", request.url))
  }

  // If no code and no error, redirect to login
  return NextResponse.redirect(new URL("/login", request.url))
}
