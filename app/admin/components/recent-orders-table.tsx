"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Order = {
  id: string;
  recipient_name: string;
  status: string;
  total: number;
  created_at: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-blue-500" },
  processing: { label: "Processing", color: "bg-purple-500" },
  shipped: { label: "Shipped", color: "bg-indigo-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  refunded: { label: "Refunded", color: "bg-gray-500" },
};

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      const supabase = getBrowserSupabaseClient();

      const { data } = await supabase
        .from("orders")
        .select("id, recipient_name, status, total, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchRecentOrders();
  }, []);

  const formatCurrency = (value: number) => 
    `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

  const formatOrderId = (id: string) => 
    `#${id.slice(0, 8).toUpperCase()}`;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <Link href="/admin/orders" className="text-sm text-[#00ccff] hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-600">Order ID</TableHead>
                <TableHead className="text-gray-600">Customer</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status] || { 
                  label: order.status, 
                  color: "bg-gray-500" 
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-mono">
                      {formatOrderId(order.id)}
                    </TableCell>
                    <TableCell>{order.recipient_name}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

