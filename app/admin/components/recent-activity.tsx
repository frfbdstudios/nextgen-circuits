"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, Box, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const activities = [
  {
    icon: ShoppingCart,
    iconColor: "text-blue-600",
    text: "New Order from Sarah Johnson",
    time: "5 minutes ago",
  },
  {
    icon: Users,
    iconColor: "text-green-600",
    text: "New Customer registered",
    time: "1 hour ago",
  },
  {
    icon: Box,
    iconColor: "text-red-600",
    text: "Low Stock Alert for Arduino Nano",
    time: "3 hours ago",
  },
  {
    icon: Star,
    iconColor: "text-orange-600",
    text: "New Review for Raspberry Pi 4",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="icon" className="size-8">
          <RefreshCw className="size-4 text-gray-600" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`${activity.iconColor} bg-gray-50 rounded-full p-2 flex items-center justify-center`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

