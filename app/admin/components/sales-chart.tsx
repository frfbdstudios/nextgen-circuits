"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
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

type SalesData = {
  label: string;
  revenue: number;
};

type Period = "last-week" | "last-month" | "last-year";

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([]);
  const [period, setPeriod] = useState<Period>("last-month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSalesData() {
      setLoading(true);
      const supabase = getBrowserSupabaseClient();
      
      const now = new Date();
      let startDate: Date;
      let groupBy: "day" | "month";

      switch (period) {
        case "last-week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = "day";
          break;
        case "last-month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          groupBy = "day";
          break;
        case "last-year":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          groupBy = "month";
          break;
      }

      const { data: orders } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", startDate.toISOString())
        .in("status", ["delivered", "confirmed", "processing", "shipped"])
        .order("created_at", { ascending: true });

      if (!orders) {
        setData([]);
        setLoading(false);
        return;
      }

      // Group orders by period
      const grouped = new Map<string, number>();

      orders.forEach((order: { created_at: string | number | Date; total: any; }) => {
        const date = new Date(order.created_at);
        let key: string;

        if (groupBy === "day") {
          key = date.toLocaleDateString("en-BD", { month: "short", day: "numeric" });
        } else {
          key = date.toLocaleDateString("en-BD", { month: "short" });
        }

        const current = grouped.get(key) || 0;
        grouped.set(key, current + (Number(order.total) || 0));
      });

      const chartData: SalesData[] = Array.from(grouped.entries()).map(([label, revenue]) => ({
        label,
        revenue,
      }));

      setData(chartData);
      setLoading(false);
    }

    fetchSalesData();
  }, [period]);

  const formatCurrency = (value: number) => `৳${value.toLocaleString("en-BD")}`;

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">Sales Analytics</CardTitle>
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
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
            <p className="text-muted-foreground">No sales data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ccff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ccff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00ccff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

