"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  preview_image?: string | null;
}

interface CategoryGroup {
  id: string;
  name: string;
  description: string;
  category_ids: string[];
  created_at: string;
  updated_at: string;
}

interface CategoryData {
  id: string;
  title: string;
  description: string;
  subcategories: Category[];
}

export default function CategoriesComponent() {
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        // Fetch all category groups
        const { data: categoryGroups, error: groupsError } = await supabase
          .from('category_groups')
          .select('*')
          .order('created_at', { ascending: true });

        if (groupsError) throw groupsError;

        // Fetch all categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        console.log('Fetched categories:', categories);

        // Fetch first product image for each category
        const categoriesWithImages = await Promise.all(
          (categories || []).map(async (cat: Category) => {
            console.log('Looking for products with category:', cat.name);

            // Try exact match first
            let { data: products, error: productsError } = await supabase
              .from('products')
              .select('images, category')
              .eq('category', cat.id)
              .eq('is_active', true)
              .limit(10);

            if (productsError) {
              console.error('Error fetching products for category', cat.name, productsError);
            }

            console.log('Fetched products for category', cat.name, ':', products);
            console.log('Number of products found:', products?.length || 0);

            // Filter products that actually have images
            const productsWithImages = products?.filter((p: any) =>
              p.images && Array.isArray(p.images) && p.images.length > 0
            ) || [];

            console.log('Products with images for', cat.name, ':', productsWithImages.length);

            // Get the first image from the first product's images array
            const previewImage = productsWithImages[0]?.images?.[0] || null;

            console.log('Preview image for', cat.name, ':', previewImage);

            return {
              ...cat,
              preview_image: previewImage,
            };
          })
        );

        console.log('Categories with images:', categoriesWithImages);

        // Map category groups with their categories
        const mappedData: CategoryData[] = (categoryGroups || []).map((group: CategoryGroup) => {
          const groupCategories = categoriesWithImages.filter((cat: Category) =>
            group.category_ids.includes(cat.id)
          );

          return {
            id: group.id,
            title: group.name,
            description: group.description,
            subcategories: groupCategories,
          };
        });

        setCategoriesData(mappedData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoriesData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        <div className="min-h-screen bg-background">
          {/* Page Title Section */}
          <section
            className="relative overflow-hidden py-20 text-center shadow-lg rounded-b-3xl mb-16"
            style={{
              background: `linear-gradient(135deg, var(--hero-bg) 0%, var(--hero-bg) 100%)`,
              boxShadow: `0 4px 20px var(--shadow-light)`,
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full z-0"
              style={{ background: "var(--decorative-blue)" }}
            />
            <div
              className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full z-0"
              style={{ background: "var(--decorative-blue)" }}
            />

            <div className="container relative z-10 mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  color: "var(--hero-text)",
                  textShadow: `1px 1px 2px var(--shadow-medium)`,
                }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Product Categories
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  color: "var(--text-gray)",
                }}
                className="text-lg md:text-xl max-w-2xl mx-auto"
              >
                Explore our wide range of products across various categories.
              </motion.p>
            </div>
          </section>

          {/* Categories Section */}
          <div className="container mx-auto px-4 py-12">
            {categoriesData.length === 0 ? (
              <p className="text-center text-muted-foreground">No categories available.</p>
            ) : (
              <motion.div
                className="space-y-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {categoriesData.map((category) => (
                  <motion.div
                    key={category.id}
                    id={category.id}
                    className="scroll-mt-20"
                    variants={itemVariants}
                  >
                    {/* Category Header */}
                    <div className="mb-8">
                      <motion.h2
                        className="text-3xl font-bold mb-2 text-center"
                        initial={{ opacity: 0, x: 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                      >
                        {category.title}
                      </motion.h2>
                      <motion.p
                        className="text-muted-foreground text-lg text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        {category.description}
                      </motion.p>
                    </div>

                    {/* Subcategories Grid */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {category.subcategories.map((subcategory) => (
                        <motion.div
                          key={subcategory.id}
                          variants={cardVariants}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video overflow-hidden bg-muted relative">
                              {subcategory.preview_image ? (
                                <Image
                                  src={subcategory.preview_image}
                                  alt={subcategory.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-muted-foreground">No Image</span>
                                </div>
                              )}
                            </div>
                            <CardHeader>
                              <CardTitle className="text-xl">{subcategory.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-sm">
                                {subcategory.description || 'No description available'}
                              </CardDescription>
                            </CardContent>
                            <CardFooter>
                              <Button asChild variant="default" className="w-full">
                                <Link href={`/products?category=${subcategory.id}`}>
                                  View Category
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}