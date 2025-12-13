"use client";

import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EmailSettings() {
  return (
    <div className="settings-section bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Mail className="size-5 text-[#3498db]" />
        Email Settings
      </h2>
      <form id="emailSettingsForm" className="settings-form space-y-4">
        <div className="form-group">
          <Label htmlFor="smtpServer">SMTP Server</Label>
          <Input type="text" id="smtpServer" placeholder="mail.example.com" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input type="number" id="smtpPort" placeholder="587" />
          </div>
          <div className="form-group">
            <Label htmlFor="smtpSecurity">Security</Label>
            <Select defaultValue="tls">
              <SelectTrigger id="smtpSecurity">
                <SelectValue placeholder="Select security" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="form-group">
          <Label htmlFor="smtpUsername">Username</Label>
          <Input type="text" id="smtpUsername" placeholder="username@example.com" />
        </div>
        <div className="form-group">
          <Label htmlFor="smtpPassword">Password</Label>
          <Input type="password" id="smtpPassword" placeholder="••••••••" />
        </div>
        <div className="settings-actions flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-[#3498db] text-[#3498db] hover:bg-[#3498db] hover:text-white"
          >
            <Send className="size-4 mr-2" />
            Test Connection
          </Button>
          <Button type="submit" className="bg-[#3498db] hover:bg-[#2980b9] text-white">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

