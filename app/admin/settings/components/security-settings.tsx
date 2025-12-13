"use client";

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SecuritySettings() {
  return (
    <div className="settings-section bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Shield className="size-5 text-[#3498db]" />
        Security Settings
      </h2>
      <form id="securitySettingsForm" className="settings-form space-y-4">
        <div className="form-group">
          <Label>Security Options</Label>
          <div className="checkbox-group space-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 text-[#3498db]" />
              <span className="text-gray-700">Two-Factor Authentication</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 text-[#3498db]" />
              <span className="text-gray-700">SSL Certificate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 text-[#3498db]" />
              <span className="text-gray-700">Auto Logout (30 mins)</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <Label htmlFor="passwordPolicy">Password Policy</Label>
          <Select defaultValue="strong">
            <SelectTrigger id="passwordPolicy">
              <SelectValue placeholder="Select password policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strong">Strong (min. 12 chars)</SelectItem>
              <SelectItem value="medium">Medium (min. 8 chars)</SelectItem>
              <SelectItem value="basic">Basic (min. 6 chars)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

