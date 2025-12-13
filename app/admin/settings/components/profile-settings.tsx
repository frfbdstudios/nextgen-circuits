"use client";

import { UserCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettings() {
  return (
    <div className="settings-section bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <UserCircle className="size-5 text-[#3498db]" />
        Profile Settings
      </h2>
      <div className="profile-settings flex flex-col md:flex-row gap-6">
        <div className="profile-avatar flex-shrink-0">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
            <img
              src="https://via.placeholder.com/120"
              alt="Admin Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Upload className="size-6 text-white" />
            </div>
          </div>
          <button className="mt-3 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            Change Photo
          </button>
        </div>
        <div className="profile-info flex-1">
          <form id="profileSettingsForm" className="settings-form space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="firstName">First Name</Label>
                <Input type="text" id="firstName" defaultValue="Admin" />
              </div>
              <div className="form-group">
                <Label htmlFor="lastName">Last Name</Label>
                <Input type="text" id="lastName" defaultValue="User" />
              </div>
            </div>
            <div className="form-group">
              <Label htmlFor="email">Email Address</Label>
              <Input type="email" id="email" defaultValue="admin@nextgencircuits.com" />
            </div>
            <div className="form-group">
              <Label htmlFor="role">Role</Label>
              <Input type="text" id="role" defaultValue="Administrator" readOnly className="bg-gray-100" />
            </div>
            <Button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white">
              Save Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

