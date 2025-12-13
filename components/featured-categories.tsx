"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Loader2, FolderOpen } from "lucide-react";
import { landingPageService, type PopularCategory } from "@/lib/supabase/landing-page";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<(PopularCategory & { image: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularCategories();
  }, []);

  const loadPopularCategories = async () => {
    setLoading(true);
    const data = await landingPageService.getPopularCategories();
    // Filter only active categories
    const activeCategories = data.filter(c => c.is_active && c.category);
    
    if (activeCategories.length === 0) {
      setCategories([]);
      setLoading(false);
      return;
    }

    // Fetch first product image for each category using category IDs
    const supabase = getBrowserSupabaseClient();
    const categoryIds = activeCategories
      .map(c => c.category?.id)
      .filter(Boolean) as string[];

    // Get first product image for each category (products.category stores category ID)
    const { data: products } = await supabase
      .from('products')
      .select('category, images')
      .in('category', categoryIds)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    // Create a map of category ID to first product image
    const categoryImageMap: Record<string, string | null> = {};
    for (const product of products || []) {
      if (!categoryImageMap[product.category] && product.images && product.images.length > 0) {
        categoryImageMap[product.category] = product.images[0];
      }
    }

    // Add image to each category
    const categoriesWithImages = activeCategories.map(item => ({
      ...item,
      image: item.custom_image_url || (item.category?.id ? categoryImageMap[item.category.id] : null)
    }));

    setCategories(categoriesWithImages);
    setLoading(false);
  };

  // Get the first available image from all categories as fallback
  const getFirstAvailableImage = (): string | null => {
    for (const item of categories) {
      if (item.image) {
        return item.image;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <section className="featured-categories py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Categories
          </h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const fallbackImage = getFirstAvailableImage();

  return (
    <section className="featured-categories py-16">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Popular Categories
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item, index) => {
            const category = item.category;
            if (!category) return null;

            // Use item's image, fallback to first available image
            const imageUrl = item.image || fallbackImage;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/products?category=${category.id}`}>
                  <Card className="category-card overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FolderOpen className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {category.name}
                        </h3>
                        <Button variant="outline" className="w-full">
                          View Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}