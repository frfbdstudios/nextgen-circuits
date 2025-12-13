'use client';

import { useUser } from "@/hooks/use-user";
import { AdminSidebar } from "./components/admin-sidebar";
import "./globals.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { isAdmin, isManager } from "@/lib/supabase/role-access-control";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Separate component that uses useSearchParams
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isManagerUser, setIsManagerUser] = useState<boolean | null>(null);

  // Handle access denied error from middleware
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'access_denied') {
      toast.error("Access Denied", {
        description: "You don't have permission to access that page.",
        duration: 5000,
      })
      // Clean up URL without causing a re-render loop
      router.replace('/admin', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && !user) {
        router.push('/login');
        return;
      }
      if (!isLoading && user) {
        const admin = await isAdmin(user);
        const manager = await isManager(user);
        setIsAdminUser(admin);
        setIsManagerUser(manager);
        if (!admin && !manager) {
          router.push('/');
        }
      }
    };
    checkAdmin();
  }, [user, isLoading, router]);

  if (isLoading || isAdminUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (!isAdminUser && !isManagerUser)) {
    return null; // Will redirect
  }

  if (user && (isAdminUser || isManagerUser)) {
    return (
      <div className="admin-body admin-container">
        <AdminSidebar />
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return null;
}

// Main layout wrapper with Suspense
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
