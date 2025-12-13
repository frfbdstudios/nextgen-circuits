"use client"

import { useEffect, useState } from "react"
import { getBrowserSupabaseClient } from "@/lib/supabase/browser"
import type { User } from "@supabase/supabase-js"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = getBrowserSupabaseClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setError(error)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  return { user, isLoading, error }
}
