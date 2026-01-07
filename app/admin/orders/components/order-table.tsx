"use client";

import { Eye, Truck, ExternalLink, CheckCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Order {
  payment_number: any;
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_zone: string;
  recipient_area: string;
  created_at: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
  payment_method: string;
  pathao_consignment_id?: string;
  special_instruction?: string;
  payment_transaction_id?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    sku: string;
    images: string[];
  };
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

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

interface OrderTableProps {
  onOrderUpdate?: () => void;
  searchQuery?: string;
  statusFilter?: string;
  timeRangeFilter?: string;
}

export function OrderTable({ 
  onOrderUpdate, 
  searchQuery = "", 
  statusFilter = "all-status",
  timeRangeFilter = "all-time" 
}: OrderTableProps = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [placingOrderId, setPlacingOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
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

  async function fetchOrderItems(orderId: string) {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price,
          products (
            name,
            sku,
            images
          )
        `)
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching order items:", error);
        throw error;
      }
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      setUpdatingStatusId(orderId);

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Set timestamp fields based on status
      switch (newStatus) {
        case "confirmed":
          updateData.confirmed_at = new Date().toISOString();
          break;
        case "shipped":
          updateData.shipped_at = new Date().toISOString();
          break;
        case "delivered":
          updateData.delivered_at = new Date().toISOString();
          break;
        case "cancelled":
          updateData.cancelled_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
        return;
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));

      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success(`Order status updated to ${newStatus}`);
      
      // Notify parent to refresh stats
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatusId(null);
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
        toast.error("Failed to approve order");
        return;
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: "confirmed" }
          : order
      ));

      toast.success("Order approved successfully");
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order");
    } finally {
      setApprovingId(null);
    }
  }

  async function placeOrderInPathao(orderId: string) {
    await approveOrder(orderId);
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
        toast.error(data.error || "Failed to place order in Pathao");
        return;
      }

      toast.success(`Order placed in Pathao! Consignment ID: ${data.data.consignment_id}`);

      await fetchOrders();
      
      // Notify parent to refresh stats
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error("Error placing order in Pathao:", error);
      toast.error("Failed to place order in Pathao");
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

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
    await fetchOrderItems(order.id);
  };

  const getTrackingUrl = (consignmentId: string, phone: string) => {
    return `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${phone}`;
  };

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.recipient_name.toLowerCase().includes(query) ||
          order.recipient_phone.includes(query)
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "all-status") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Time range filter
    if (timeRangeFilter && timeRangeFilter !== "all-time") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        switch (timeRangeFilter) {
          case "today":
            return orderDate >= startOfToday;
          case "week":
            return orderDate >= startOfWeek;
          case "month":
            return orderDate >= startOfMonth;
          case "year":
            return orderDate >= startOfYear;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, timeRangeFilter]);

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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  {searchQuery || statusFilter !== "all-status" || timeRangeFilter !== "all-time"
                    ? "No orders found matching your filters"
                    : "No orders found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
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
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                      disabled={updatingStatusId === order.id}
                    >
                      <SelectTrigger className="w-[140px] h-7 text-xs">
                        <SelectValue>
                          <Badge className={`${statusColors[order.status] || "bg-gray-500"} text-white capitalize text-xs`}>
                            {order.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${statusColors[status.value]}`} />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {(order.status === "pending") && !order.pathao_consignment_id && (
                        <Button
                          variant={"secondary"}
                          size={"icon"}
                          onClick={() => placeOrderInPathao(order.id)}
                          disabled={placingOrderId === order.id}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                {loadingItems ? (
                  <div className="text-center py-4 text-gray-500">Loading items...</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.products.images && item.products.images.length > 0 ? (
                                  <img
                                    src={item.products.images[0]}
                                    alt={item.products.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No image</span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-sm">{item.products.name}</p>
                                  <p className="text-xs text-gray-500">{item.products.sku}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.delivery_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(selectedOrder.total)}</span>
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
                    <span className="text-gray-600">Status:</span>
                    <div className="mt-1">
                      <Badge className={`${statusColors[selectedOrder.status] || "bg-gray-500"} text-white capitalize`}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <p className="font-medium capitalize">{selectedOrder.payment_status}</p>
                  </div>
                  {selectedOrder.payment_number && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Payment Number:</span>
                      <p className="font-medium">{selectedOrder.payment_number}</p>
                    </div>
                  )}
                  {selectedOrder.payment_transaction_id && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Payment Transaction ID:</span>
                      <p className="font-medium font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                        {selectedOrder.payment_transaction_id}
                      </p>
                    </div>
                  )}
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

              {/* Special Instructions */}
              {selectedOrder.special_instruction && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Special Instructions</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.special_instruction}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

