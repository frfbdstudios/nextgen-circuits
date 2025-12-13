"use client";

import { Eye, Truck, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_zone: string;
  recipient_area: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  pathao_consignment_id?: string;
  notes?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  processing: "bg-indigo-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
  refunded: "bg-gray-500",
};

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveOrder(orderId: string) {
    try {
      setApprovingId(orderId);
      const { error } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error approving order:", error);
        alert("Failed to approve order");
        return;
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: "confirmed" }
          : order
      ));
    } catch (error) {
      console.error("Error approving order:", error);
      alert("Failed to approve order");
    } finally {
      setApprovingId(null);
    }
  }

  async function placeOrderInPathao(orderId: string) {
    await approveOrder(orderId); // Ensure order is approved before placing in Pathao
    try {
      setPlacingOrderId(orderId);
      
      const response = await fetch("/api/pathao/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to place order in Pathao");
        return;
      }

      alert(`Order placed in Pathao successfully! Consignment ID: ${data.data.consignment_id}`);
      
      // Refresh orders to get updated data
      await fetchOrders();
    } catch (error) {
      console.error("Error placing order in Pathao:", error);
      alert("Failed to place order in Pathao");
    } finally {
      setPlacingOrderId(null);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getTrackingUrl = (consignmentId: string, phone: string) => {
    return `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${phone}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Total</TableHead>
              <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-gray-700">{order.recipient_name}</TableCell>
                  <TableCell className="text-gray-700">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="text-gray-700 capitalize">{order.payment_method}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[order.status] || "bg-gray-500"} text-white capitalize`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {order.status !== "confirmed" && !order.pathao_consignment_id && (
                        <Button
                          variant={"secondary"}
                          size={"icon"}
                          onClick={() => placeOrderInPathao(order.id)}
                          disabled={placingOrderId === order.id}
                          // className="p-2 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Place in Pathao"
                          aria-label="Place order in Pathao"
                        >
                          <Truck
                            size={16}
                            className={placingOrderId === order.id ? "text-gray-400" : "text-primary"}
                          />
                        </Button>
                      )}
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                        aria-label="View order"
                      >
                        <Eye size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedOrder.recipient_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedOrder.recipient_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{selectedOrder.recipient_address}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">City:</span>
                    <p className="font-medium">{selectedOrder.recipient_city}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Zone:</span>
                    <p className="font-medium">{selectedOrder.recipient_zone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <p className="font-medium">{selectedOrder.recipient_area}</p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={`${statusColors[selectedOrder.status] || "bg-gray-500"} text-white capitalize`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <p className="font-medium capitalize">{selectedOrder.payment_status}</p>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {selectedOrder.pathao_consignment_id && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Tracking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Consignment ID:</span>
                      <p className="font-medium">{selectedOrder.pathao_consignment_id}</p>
                    </div>
                    <Button
                      onClick={() => window.open(getTrackingUrl(selectedOrder.pathao_consignment_id!, selectedOrder.recipient_phone), '_blank')}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Track Order on Pathao
                    </Button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

