"use client";

import { useEffect, useState } from "react";
import { Eye, ExternalLink } from "lucide-react";
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
import { OrderFilters } from "./order-filters";

type Order = {
  payment_number: string;
  payment_transaction_id: string;
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  pathao_consignment_id: string | null;
  created_at: string;
  item_quantity: number;
  special_instruction: string | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    sku: string;
    images: string[];
  };
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-blue-500" },
  processing: { label: "Processing", color: "bg-indigo-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  delivered: { label: "Delivered", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
  refunded: { label: "Refunded", color: "bg-gray-500" },
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data);
        setFilteredOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  async function fetchOrderItems(orderId: string) {
    try {
      setLoadingItems(true);
      const supabase = getBrowserSupabaseClient();
      
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

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
    await fetchOrderItems(order.id);
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
      <OrderFilters
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "No orders found matching your filters"
                : "No orders yet"}
            </div>
          </div>
        ) : (
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
                {filteredOrders.map((order) => {
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
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details {selectedOrder && formatOrderId(selectedOrder.id)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Status</h3>
                <Badge
                  className={`${
                    statusConfig[selectedOrder.status]?.color || "bg-gray-500"
                  } text-white`}
                >
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
                <p className="text-xs text-gray-500 mt-2">
                  Ordered on {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              {/* Tracking Link */}
              {selectedOrder.pathao_consignment_id && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Track Your Order</h3>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(
                      getTrackingUrl(
                        selectedOrder.pathao_consignment_id!,
                        selectedOrder.recipient_phone
                      ),
                      '_blank'
                    )}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Track on Pathao
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Consignment ID: {selectedOrder.pathao_consignment_id}
                  </p>
                </div>
              )}

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

              {/* Recipient Details */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Delivery Information</h3>
                <div className="space-y-1 text-sm bg-gray-50 rounded-lg p-4">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">{selectedOrder.recipient_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium">{selectedOrder.recipient_phone}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Address:</span>{" "}
                    <span className="font-medium">{selectedOrder.recipient_address}</span>
                  </p>
                </div>
              </div>

              {/* Payment Details */}
                <div>
                <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm bg-gray-50 rounded-lg p-4">
                  <p>
                  <span className="text-gray-600">Method:</span>{" "}
                  <span className="font-medium">
                    {paymentMethodLabels[selectedOrder.payment_method] ||
                    selectedOrder.payment_method}
                  </span>
                  </p>
                  <p>
                  <span className="text-gray-600">Status:</span>{" "}
                  <span className="font-medium capitalize">{selectedOrder.payment_status}</span>
                  </p>
                  {selectedOrder.payment_number && (
                  <p>
                    <span className="text-gray-600">Payment Number:</span>{" "}
                    <span className="font-medium">{selectedOrder.payment_number}</span>
                  </p>
                  )}
                  
                  {selectedOrder.payment_transaction_id && (
                  <p>
                    <span className="text-gray-600">Transaction ID:</span>{" "}
                    <span className="font-medium">{selectedOrder.payment_transaction_id}</span>
                  </p>
                  )}
                </div>
                </div>

              {/* Special Instructions */}
              {selectedOrder.special_instruction && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.special_instruction}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

