"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

type WishlistItem = {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    is_active: boolean;
    sku: string;
  };
};

export function WishlistTab() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    const supabase = getBrowserSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data } = await supabase
      .from("wishlists")
      .select(`
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          images,
          stock,
          is_active,
          sku
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setWishlist(data as WishlistItem[]);
    }
    setLoading(false);
  }

  async function removeFromWishlist(wishlistId: string) {
    const supabase = getBrowserSupabaseClient();

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistId);

    if (error) {
      toast.error("Failed to remove from wishlist");
      return;
    }

    setWishlist(wishlist.filter(item => item.id !== wishlistId));
    toast.success("Removed from wishlist");
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  const getProductUrl = (sku: string) => {
    return `/products/${sku.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mt-1">Add products to your wishlist to see them here</p>
          <Link href="/products">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">My Wishlist</h3>
        <p className="text-sm text-gray-500">{wishlist.length} items</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlist.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.products.images[0] || "/placeholder.png"}
                      alt={item.products.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Link 
                    href={getProductUrl(item.products.sku)}
                    className="font-medium hover:text-[#00ccff] transition-colors"
                  >
                    {item.products.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">SKU: {item.products.sku}</p>
                </TableCell>
                <TableCell className="font-semibold text-[#00ccff]">
                  {formatCurrency(Number(item.products.price))}
                </TableCell>
                <TableCell>
                  {item.products.stock > 0 ? (
                    <span className="text-green-600 text-sm font-medium">
                      In Stock ({item.products.stock})
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm font-medium">
                      Out of Stock
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={getProductUrl(item.products.sku)}>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!item.products.is_active || item.products.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}