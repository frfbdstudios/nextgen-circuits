'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrowserSupabaseClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, TrendingUp, DollarSign, Percent } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface ProfitMetrics {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  orderCount: number
  averageProfit: number
}

export function ProfitAnalytics() {
  const supabase = getBrowserSupabaseClient()
  const [metrics, setMetrics] = useState<ProfitMetrics>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    orderCount: 0,
    averageProfit: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })

  const fetchProfitData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    try {
      setLoading(true)

      // Fetch orders with their items and product costs
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          order_items (
            quantity,
            price,
            product_id
          )
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .in('status', ['delivered', 'confirmed', 'processing', 'shipped'])

      if (ordersError) throw ordersError

      // Get all unique product IDs
      const productIds = Array.from(
        new Set(
          orders?.flatMap((order: { order_items: any[] }) => 
            order.order_items?.map(item => item.product_id)
          ) || []
        )
      )

      // Fetch buying prices for all products
      const { data: productCosts, error: costsError } = await supabase
        .from('product_latest_costs')
        .select('product_id, buying_price')
        .in('product_id', productIds)

      if (costsError) throw costsError

      // Create a map of product costs
      const costMap = new Map(
        productCosts?.map((cost: { product_id: any; buying_price: any }) => [cost.product_id, cost.buying_price]) || []
      )

      // Calculate metrics
      let totalRevenue = 0
      let totalCost = 0

      orders?.forEach((order: { total: any; order_items: any[] }) => {
        totalRevenue += Number(order.total) || 0

        order.order_items?.forEach(item => {
          const buyingPrice = Number(costMap.get(item.product_id)) || 0
          totalCost += buyingPrice * item.quantity
        })
      })

      const totalProfit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
      const orderCount = orders?.length || 0
      const averageProfit = orderCount > 0 ? totalProfit / orderCount : 0

      setMetrics({
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        orderCount,
        averageProfit,
      })
    } catch (error) {
      console.error('Error fetching profit data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfitData()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const resetToCurrentMonth = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    })
  }

  const setLast7Days = () => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    setDateRange({ from: sevenDaysAgo, to: today })
  }

  const setLast30Days = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    setDateRange({ from: thirtyDaysAgo, to: today })
  }

  const setLast90Days = () => {
    const today = new Date()
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)
    setDateRange({ from: ninetyDaysAgo, to: today })
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Profit & Revenue Analytics</CardTitle>
            <CardDescription>Admin-only financial breakdown</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 space-y-3">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="flex flex-col gap-2 border-t pt-3">
                    <p className="text-sm font-medium">Quick select:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={setLast7Days}
                        variant="outline"
                        size="sm"
                      >
                        Last 7 days
                      </Button>
                      <Button
                        onClick={setLast30Days}
                        variant="outline"
                        size="sm"
                      >
                        Last 30 days
                      </Button>
                      <Button
                        onClick={setLast90Days}
                        variant="outline"
                        size="sm"
                      >
                        Last 90 days
                      </Button>
                      <Button
                        onClick={resetToCurrentMonth}
                        variant="outline"
                        size="sm"
                      >
                        This month
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={fetchProfitData} variant="outline" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="p-4 border rounded-lg bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCost)}</p>
              </div>
            </div>
          </div>

          {/* Total Profit */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalProfit)}</p>
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="p-4 border rounded-lg bg-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.profitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Order Count */}
          <div className="p-4 border rounded-lg bg-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.orderCount}</p>
              </div>
            </div>
          </div>

          {/* Average Profit per Order */}
          <div className="p-4 border rounded-lg bg-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Profit/Order</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageProfit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metric</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Revenue</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(metrics.totalRevenue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">100%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Cost of Goods</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">-{formatCurrency(metrics.totalCost)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {metrics.totalRevenue > 0 ? ((metrics.totalCost / metrics.totalRevenue) * 100).toFixed(2) : 0}%
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900">Net Profit</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">{formatCurrency(metrics.totalProfit)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{metrics.profitMargin.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}