"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type ProductData = {
  product: string;
  count: number;
};

const colors = ["#00ccff", "#00b87a", "#9333ea", "#6b7280", "#f97316"];

export function PopularProductsChart() {
  const [data, setData] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = getBrowserSupabaseClient();
      
      const { data: products } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);

      if (products) {
        const uniqueCategories = [...new Set((products.map((p: { category: any; }) => p.category) as string[]))];
        setCategories(uniqueCategories);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchPopularProducts() {
      setLoading(true);
      const supabase = getBrowserSupabaseClient();

      // Fetch order items with product info
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          quantity,
          product_id,
          products (
            name,
            category
          )
        `);

      if (!orderItems) {
        setData([]);
        setLoading(false);
        return;
      }

      // Aggregate by product
      const productCounts = new Map<string, { name: string; count: number; category: string }>();

      orderItems.forEach((item: any) => {
        if (!item.products) return;
        
        const productName = item.products.name;
        const category = item.products.category;

        // Filter by category if selected
        if (selectedCategory !== "all-categories" && category !== selectedCategory) {
          return;
        }

        const current = productCounts.get(productName) || { name: productName, count: 0, category };
        productCounts.set(productName, {
          ...current,
          count: current.count + (item.quantity || 1),
        });
      });

      // Sort by count and take top 5
      const sortedProducts = Array.from(productCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(({ name, count }) => ({ product: name, count }));

      setData(sortedProducts);
      setLoading(false);
    }

    fetchPopularProducts();
  }, [selectedCategory]);

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Popular Products</CardTitle>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No product data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="product" 
                stroke="#6b7280" 
                fontSize={12}
                width={100}
                tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value} sold`, "Quantity"]}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
