"use client";

import { useEffect, useState } from "react";
import { User, Mail } from "lucide-react";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Profile = {
  full_name: string | null;
  email: string | null;
};

export function MyProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="text-[#9b59b6]" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">My Profile</h3>
            <p className="text-sm text-gray-500">Personal information</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : !profile ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-3">Profile not found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{profile.full_name || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900 text-sm break-all">{profile.email || "Not set"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <Link href="/user/profile">
          <button className="w-full px-4 py-2 bg-[#9b59b6] hover:bg-[#8e44ad] text-white rounded-lg text-sm font-medium transition-colors">
            Edit Profile
          </button>
        </Link>
      </div>
    </div>
  );
}

