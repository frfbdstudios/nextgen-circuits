import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next()
  }

  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Refresh token and get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not logged in and trying to access protected routes
  if (!user && pathname.startsWith("/user")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/user"
    return NextResponse.redirect(url)
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    // Not logged in - redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Get user's role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role || "user"

    // Regular users cannot access admin at all
    if (role === "user") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    // Admins have full access
    if (role === "admin") {
      return supabaseResponse
    }

    // Managers - check restricted URLs
    if (role === "manager") {
      const { data: restrictedUrls } = await supabase
        .from("restricted_urls")
        .select("url_pattern")

      if (restrictedUrls && restrictedUrls.length > 0) {
        const isRestricted = restrictedUrls.some((item) => {
          const pattern = item.url_pattern
          // Exact match or sub-path match
          return pathname === pattern || pathname.startsWith(pattern + "/")
        })

        if (isRestricted) {
          // Redirect to admin dashboard with error message
          const url = request.nextUrl.clone()
          url.pathname = "/admin"
          url.searchParams.set("error", "access_denied")
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
}
