import { Headphones, Box, RotateCcw, Cpu } from "lucide-react";
import { TicketsSection } from "./components/tickets-section";
import { KnowledgeBaseCard } from "./components/knowledge-base-card";
import { AdminHeader } from "../components/admin-header";

export default function SupportPage() {
  return (
    <>
      <div className="admin-topbar">
        <AdminHeader />
      </div>
      <div className="dashboard-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Center</h1>
        </div>

        {/* Customer Support Tickets Section */}
        <TicketsSection />

        {/* Knowledge Base Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="size-5 text-gray-700" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Knowledge Base</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <KnowledgeBaseCard
              title="Orders & Shipping"
              description="Information about order processing"
              icon={<Box size={32} className="text-[#3498db]" />}
              iconBg="bg-blue-100"
            />
            <KnowledgeBaseCard
              title="Returns & Refunds"
              description="Policies and procedures for returning"
              icon={<RotateCcw size={32} className="text-[#3498db]" />}
              iconBg="bg-blue-100"
            />
            <KnowledgeBaseCard
              title="Product Support"
              description="Technical information, specifications"
              icon={<Cpu size={32} className="text-[#3498db]" />}
              iconBg="bg-blue-100"
            />
          </div>
        </div>
      </div>
    </>
  );
}

