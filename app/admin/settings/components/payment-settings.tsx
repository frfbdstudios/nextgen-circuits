"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaymentSettings() {
  return (
    <div className="settings-section bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <CreditCard className="size-5 text-[#3498db]" />
        Payment Settings
      </h2>
      <form id="paymentSettingsForm" className="settings-form space-y-4">
        <div className="form-group">
          <Label>Payment Methods</Label>
          <div className="checkbox-group space-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 text-[#3498db]" />
              <span className="text-gray-700">Credit Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="size-4 text-[#3498db]" />
              <span className="text-gray-700">PayPal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="size-4 text-[#3498db]" />
              <span className="text-gray-700">Bank Transfer</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <Label htmlFor="currency">Default Currency</Label>
          <Select defaultValue="USD">
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
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

