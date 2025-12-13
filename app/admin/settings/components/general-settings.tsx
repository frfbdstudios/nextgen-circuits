"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GeneralSettings() {
  return (
    <div className="settings-section bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Globe className="size-5 text-[#3498db]" />
        General Settings
      </h2>
      <form id="generalSettingsForm" className="settings-form space-y-4">
        <div className="form-group">
          <Label htmlFor="siteName">Site Name</Label>
          <Input type="text" id="siteName" defaultValue="Nextgen Circuits" />
        </div>
        <div className="form-group">
          <Label htmlFor="siteDescription">Site Description</Label>
          <Textarea
            id="siteDescription"
            rows={3}
            defaultValue="Your trusted source for electronic components"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="UTC">
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="PST">PST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select defaultValue="MM/DD/YYYY">
              <SelectTrigger id="dateFormat">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

