"use client";

import { useState } from "react";
import { Package, Heart, Truck } from "lucide-react";
import { UserHeader } from "../components/user-header";
import { DeliveryDetails } from "./components/delivery-details";
import { OrdersTab } from "./components/orders-tab";
import { WishlistTab } from "./components/wishlist-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckoutForm } from "@/app/(public)/checkout/components/checkout-form";

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("delivery");

  return (
    <>
      <UserHeader title="My Profile" subtitle="Manage your personal information" />
      
      <div className="dashboard-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="profile-tabs-list mb-6 bg-white border border-gray-200 rounded-lg p-1 flex-wrap h-auto w-full justify-start gap-1">
            <TabsTrigger value="delivery" className="profile-tab-trigger flex items-center gap-1 md:gap-2 data-[state=active]:bg-[#3498db] data-[state=active]:text-white text-xs md:text-sm px-2 md:px-4 py-2">
              <Truck size={14} className="md:size-4 shrink-0" />
              <span className="hidden sm:inline">Delivery Details</span>
              <span className="sm:hidden">Delivery</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="profile-tab-trigger flex items-center gap-1 md:gap-2 data-[state=active]:bg-[#3498db] data-[state=active]:text-white text-xs md:text-sm px-2 md:px-4 py-2">
              <Package size={14} className="md:size-4 shrink-0" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="profile-tab-trigger flex items-center gap-1 md:gap-2 data-[state=active]:bg-[#3498db] data-[state=active]:text-white text-xs md:text-sm px-2 md:px-4 py-2">
              <Heart size={14} className="md:size-4 shrink-0" />
              <span>Wishlist</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivery">
            <DeliveryDetails />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="wishlist">
            <WishlistTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

