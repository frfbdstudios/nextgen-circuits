"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Loader2, Coins } from "lucide-react";
import { landingPageService, type FeaturedProduct } from "@/lib/supabase/landing-page";
import { discountService } from "@/lib/supabase/discounts";
import { addToCart } from "@/lib/actions/cart";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductPrice from "@/app/(public)/products/components/product-price";
import ProductRating from "@/app/(public)/products/components/product-rating";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Record<string, boolean>>({});
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    const data = await landingPageService.getFeaturedProducts();
    // Filter only active products
    const activeProducts = data.filter(p => p.is_active && p.product);
    setProducts(activeProducts);
    
    // Check discounts for each product
    const discountMap: Record<string, boolean> = {};
    for (const item of activeProducts) {
      if (item.product) {
        const discount = await discountService.getProductDiscount(
          item.product.id, 
          item.product.sku // Using SKU as category fallback
        );
        discountMap[item.product.id] = !!discount;
      }
    }
    setDiscounts(discountMap);
    setLoading(false);
  };

  const handleAddToCart = async (productId: string, stock: number) => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      router.push('/login');
      return;
    }

    if (stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(
        <div className="flex items-center justify-end gap-4">
          <span>Added to cart</span>
          <Button size="sm" asChild>
            <Link href="/cart">View Cart</Link>
          </Button>
        </div>
      );
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (productId: string, stock: number) => {
    if (!user) {
      toast.error('Please log in to continue');
      router.push('/login');
      return;
    }

    if (stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      router.push('/checkout');
    } catch (error) {
      toast.error('Failed to add to cart');
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <section className="featured-products py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Products
          </h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="featured-products py-16">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Featured Products
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item, index) => {
            const product = item.product;
            if (!product) return null;

            const imageUrl = product.images && product.images.length > 0
              ? product.images[0]
              : '/placeholder-product.jpg';

            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock <= 10;
            const hasDiscount = discounts[product.id];
            const isAdding = addingToCart === product.id;

            return (
              <motion.div
                key={item.id}
                className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <a href={`/products/${product.sku}`}>
                  <div className="relative">
                    {/* Badges */}
                    {hasDiscount && (
                      <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600">
                        SALE
                      </Badge>
                    )}
                    
                    {isLowStock && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                        Only {product.stock} left
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                          <span className="text-white font-semibold text-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <ProductPrice 
                        productId={product.id} 
                        categoryId={product.sku} 
                        originalPrice={product.price} 
                      />
                      <ProductRating productId={product.id} />
                    </div>
                  </div>
                </a>
                
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                    onClick={() => handleAddToCart(product.id, product.stock)}
                    disabled={isOutOfStock || isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => handleBuyNow(product.id, product.stock)}
                    disabled={isOutOfStock || isAdding}
                  >
                    <Coins className="w-4 h-4" />
                    {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}