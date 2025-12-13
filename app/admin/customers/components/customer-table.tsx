"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, MoreVertical, Shield, User as UserIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

type Customer = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

interface CustomerTableProps {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
}

const roleColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
  manager: "bg-green-100 text-green-800",
};

const roleIcons: Record<string, React.ReactNode> = {
  user: <UserIcon size={14} />,
  admin: <Shield size={14} />,
  manager: <Shield size={14} />,
};

export function CustomerTable({ searchQuery, roleFilter, statusFilter }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, roleFilter, statusFilter, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    const supabase = getBrowserSupabaseClient();

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("is_active", statusFilter === "active");
    }

    // Pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } else {
      setCustomers(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }

    setLoading(false);
  };

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    const supabase = getBrowserSupabaseClient();

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", customerId);

    if (error) {
      toast.error("Failed to update customer status");
      console.error(error);
    } else {
      toast.success(`Customer ${!currentStatus ? "activated" : "deactivated"}`);
      fetchCustomers();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <UserIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">No customers found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Joined</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.avatar_url || undefined} />
                      <AvatarFallback className="bg-[#3498db] text-white">
                        {getInitials(customer.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {customer.full_name || "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{customer.email || "No email"}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      roleColors[customer.role] || "bg-gray-100 text-gray-800"
                    } flex items-center gap-1 w-fit`}
                  >
                    {roleIcons[customer.role]}
                    <span className="capitalize">{customer.role}</span>
                  </Badge>
                </TableCell>
                {/* <TableCell>
                  <Badge
                    className={
                      customer.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {customer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell> */}
                <TableCell className="text-sm text-gray-600">
                  {formatDate(customer.created_at)}
                </TableCell>
                {/* <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit size={16} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toggleCustomerStatus(customer.id, customer.is_active)
                        }
                      >
                        {customer.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 size={16} className="mr-2" />
                        Delete Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

