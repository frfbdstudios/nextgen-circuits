// 'use client';

// import { ShoppingCart, User, Heart, Clock, Home, LogOut } from "lucide-react";
// import { RecentOrdersCard } from "./components/recent-orders-card";
// import { MyProfileCard } from "./components/my-profile-card";
// import { MyWishlistCard } from "./components/my-wishlist-card";
// import { RecentActivityCard } from "./components/recent-activity-card";
// import { logout } from "@/lib/supabase/auth";
// import { useAuth } from "@/lib/supabase/use-auth";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function UserDashboard() {
//   const { user, loading } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     console.log('User:', user);

//     if (!loading && !user) {
//       router.push('/login') // Redirect to login if not authenticated
//     }

//   }, [user, loading, router])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Loading...</p>
//       </div>
//     )
//   }

//   if (!user) {
//     return null // Will redirect
//   }

//   return (
//     <>
//       {/* Top Bar */}
//       <div className="user-topbar">
//         <div className="flex items-center gap-3">
//           <Home className="size-6 text-[#3498db]" />
//           <div>
//             <h1 className="text-2xl font-bold">Welcome, {user.user_metadata?.full_name || user.email}!</h1>
//             <p className="text-sm">Here's an overview of your account</p>
//           </div>
//         </div>
//         <button
//           onClick={logout}
//           className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-white"
//         >
//           <LogOut size={16} />
//           Logout
//         </button>
//       </div>

//       {/* Dashboard Cards */}
//       <div className="dashboard-grid">
//         <RecentOrdersCard />
//         <MyProfileCard />
//         <MyWishlistCard />
//         <RecentActivityCard />
//       </div>
//     </>
//   );
// }

"use client"

import { logout } from "@/lib/supabase/auth"
import { useUser } from "@/hooks/use-user"
import { User, Home, LogOut } from "lucide-react";
import { RecentOrdersCard } from "./components/recent-orders-card";
import { MyProfileCard } from "./components/my-profile-card";
import { MyWishlistCard } from "./components/my-wishlist-card";
import { RecentActivityCard } from "./components/recent-activity-card";


export default function UserDashboard() {
  const { user, isLoading } = useUser()

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Top Bar */}
      <div className="user-topbar">
        <div className="flex items-center gap-3">
          <Home className="size-6 text-[#3498db]" />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.user_metadata?.full_name || user?.email}!</h1>
            <p className="text-sm">Here's an overview of your account</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-grid">
        <RecentOrdersCard />
        <MyProfileCard />
        <MyWishlistCard />
        <RecentActivityCard />
      </div>
    </>
  )
}
