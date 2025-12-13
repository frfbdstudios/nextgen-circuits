"use client";

import { useEffect, useState } from "react";
import { Eye, ExternalLink, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Order = {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  payment_method: string;
  payment_status: string;
  total: number;
  status: string;
  pathao_consignment_id: string | null;
  created_at: string;
  item_quantity: number;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-green-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-indigo-500" },
  delivered: { label: "Delivered", color: "bg-green-600" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  refunded: { label: "Refunded", color: "bg-gray-500" },
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  const formatOrderId = (id: string) => {
    return `#${id.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTrackingUrl = (consignmentId: string, phone: string) => {
    return `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${phone}`;
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Your recent orders will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Recent Orders</h3>
          <p className="text-sm text-gray-500">Last 10 orders</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status] || {
                  label: order.status,
                  color: "bg-gray-500",
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-mono">
                      {formatOrderId(order.id)}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{order.item_quantity}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details {selectedOrder && formatOrderId(selectedOrder.id)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <Badge
                  className={`${
                    statusConfig[selectedOrder.status]?.color || "bg-gray-500"
                  } text-white`}
                >
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>

              {/* Tracking Link */}
              {selectedOrder.pathao_consignment_id && (
                <div>
                  <h3 className="font-semibold mb-2">Track Your Order</h3>
                  <a
                    href={getTrackingUrl(
                      selectedOrder.pathao_consignment_id,
                      selectedOrder.recipient_phone
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#00ccff] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track on Pathao
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Consignment ID: {selectedOrder.pathao_consignment_id}
                  </p>
                </div>
              )}

              {/* Recipient Details */}
              <div>
                <h3 className="font-semibold mb-2">Recipient Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    {selectedOrder.recipient_name}
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    {selectedOrder.recipient_phone}
                  </p>
                  <p>
                    <span className="text-gray-600">Address:</span>{" "}
                    {selectedOrder.recipient_address}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Method:</span>{" "}
                    {paymentMethodLabels[selectedOrder.payment_method] ||
                      selectedOrder.payment_method}
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span className="capitalize">{selectedOrder.payment_status}</span>
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600">Items:</span>{" "}
                    {selectedOrder.item_quantity}
                  </p>
                  <p>
                    <span className="text-gray-600">Total:</span>{" "}
                    <span className="font-semibold">
                      {formatCurrency(Number(selectedOrder.total))}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Ordered on {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}