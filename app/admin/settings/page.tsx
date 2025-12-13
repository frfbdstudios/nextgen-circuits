import { Settings as SettingsIcon } from "lucide-react";
import { AdminHeader } from "../components/admin-header";
import { ProfileSettings } from "./components/profile-settings";
import { GeneralSettings } from "./components/general-settings";
import { EmailSettings } from "./components/email-settings";
import { PaymentSettings } from "./components/payment-settings";
import { SecuritySettings } from "./components/security-settings";

export default function SettingsPage() {
  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <SettingsIcon className="size-6 sm:size-8 text-[#3498db]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage system settings</p>
          </div>
        </div>

        <div className="settings-container">
          <ProfileSettings />
          <GeneralSettings />
          <EmailSettings />
          <PaymentSettings />
          <SecuritySettings />
        </div>
      </div>
    </>
  );
}

