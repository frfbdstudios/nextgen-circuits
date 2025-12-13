"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type WishlistItem = {
  id: string;
  products: {
    name: string;
    price: number;
    images: string[];
    sku: string;
  };
};

export function MyWishlistCard() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      const supabase = getBrowserSupabaseClient();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from("wishlists")
        .select(`
          id,
          products (
            name,
            price,
            images,
            sku
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) {
        setWishlist(data as WishlistItem[]);
      }
      setLoading(false);
    }

    fetchWishlist();
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  const getProductUrl = (sku: string) => {
    return `/products/${sku.toLowerCase()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Heart className="text-[#e74c3c]" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">My Wishlist</h3>
            <p className="text-sm text-gray-500">Saved items</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-500 mb-3">No items in wishlist</p>
            <Link href="/products">
              <button className="px-4 py-2 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-lg text-sm font-medium transition-colors">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.map((item) => (
              <Link
                key={item.id}
                href={getProductUrl(item.products.sku)}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={item.products.images[0] || "/placeholder.png"}
                    alt={item.products.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1 text-gray-900">
                    {item.products.name}
                  </p>
                  <p className="text-[#00ccff] font-semibold text-sm mt-1">
                    {formatCurrency(Number(item.products.price))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <Link href="/wishlist">
          <button className="w-full px-4 py-2 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-lg text-sm font-medium transition-colors">
            View All Items
          </button>
        </Link>
      </div>
    </div>
  );
}

