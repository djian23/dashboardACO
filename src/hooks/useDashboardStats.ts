import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { DashboardStats, MonthlyData, CategoryData, ActivityItem } from '@/types'

interface TicketLotRow {
  id: string
  purchase_price_total: number
  status: string
  event_id: string
}

interface ProductRow {
  id: string
  purchase_price: number | null
  status: string
  category: string
}

interface SaleRow {
  id: string
  sale_price_total: number
  fees: number
  sale_date: string
  quantity_sold: number
  ticket_lot_id: string | null
  product_id: string | null
  buyer_name: string | null
  created_at: string
}

interface EventRow {
  id: string
  name: string
  category: string
  created_at: string
}

export function useDashboardStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Run all queries in parallel for performance
      const [
        ticketLotsResult,
        productsResult,
        salesResult,
        eventsResult,
      ] = await Promise.all([
        supabase
          .from('ticket_lots')
          .select('id, purchase_price_total, status, event_id'),
        supabase
          .from('products')
          .select('id, purchase_price, status, category'),
        supabase
          .from('sales')
          .select('id, sale_price_total, fees, sale_date, quantity_sold, ticket_lot_id, product_id, buyer_name, created_at'),
        supabase
          .from('events')
          .select('id, name, category, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      if (ticketLotsResult.error) throw ticketLotsResult.error
      if (productsResult.error) throw productsResult.error
      if (salesResult.error) throw salesResult.error
      if (eventsResult.error) throw eventsResult.error

      const ticketLots = ticketLotsResult.data as TicketLotRow[]
      const products = productsResult.data as ProductRow[]
      const sales = salesResult.data as SaleRow[]
      const events = eventsResult.data as EventRow[]

      // Total invested: ticket purchase totals + product purchase prices
      const ticketInvested = ticketLots.reduce(
        (sum, lot) => sum + (lot.purchase_price_total || 0),
        0
      )
      const productInvested = products.reduce(
        (sum, p) => sum + (p.purchase_price || 0),
        0
      )
      const totalInvested = ticketInvested + productInvested

      // Total revenue: sum of sale prices
      const totalRevenue = sales.reduce(
        (sum, s) => sum + (s.sale_price_total || 0),
        0
      )

      // Total fees
      const totalFees = sales.reduce(
        (sum, s) => sum + (s.fees || 0),
        0
      )

      // Total profit
      const totalProfit = totalRevenue - totalInvested - totalFees

      // ROI %
      const roiPercentage = totalInvested > 0
        ? (totalProfit / totalInvested) * 100
        : 0

      // Tickets in stock
      const ticketsInStock = ticketLots.filter(
        (lot) => lot.status === 'in_stock'
      ).length

      // Products in stock
      const productsInStock = products.filter(
        (p) => p.status === 'in_stock'
      ).length

      // Monthly P&L data (last 12 months)
      const monthlyData = buildMonthlyData(sales)

      // Profit by category
      const categoryData = buildCategoryData(sales, ticketLots, products, events)

      // Recent activity: last 10 sales + recent events merged and sorted
      const recentActivity = buildRecentActivity(sales, events)

      const stats: DashboardStats = {
        total_invested: totalInvested,
        total_revenue: totalRevenue,
        total_profit: totalProfit,
        roi_percentage: Math.round(roiPercentage * 100) / 100,
        tickets_in_stock: ticketsInStock,
        products_in_stock: productsInStock,
        monthly_data: monthlyData,
        category_data: categoryData,
        recent_activity: recentActivity,
      }

      return stats
    },
    enabled: !!user,
  })
}

function buildMonthlyData(sales: SaleRow[]): MonthlyData[] {
  const now = new Date()
  const months: MonthlyData[] = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const monthlySales = sales.filter((s) => s.sale_date?.startsWith(yearMonth))
    const revenue = monthlySales.reduce((sum, s) => sum + (s.sale_price_total || 0), 0)
    const fees = monthlySales.reduce((sum, s) => sum + (s.fees || 0), 0)

    months.push({
      month: yearMonth,
      revenue,
      costs: fees,
      profit: revenue - fees,
    })
  }

  return months
}

function buildCategoryData(
  sales: SaleRow[],
  ticketLots: TicketLotRow[],
  products: ProductRow[],
  events: EventRow[]
): CategoryData[] {
  const categoryMap = new Map<string, { profit: number; count: number }>()

  for (const sale of sales) {
    let category = 'Autre'

    if (sale.product_id) {
      const product = products.find((p) => p.id === sale.product_id)
      if (product) {
        category = product.category
      }
    } else if (sale.ticket_lot_id) {
      const lot = ticketLots.find((l) => l.id === sale.ticket_lot_id)
      if (lot) {
        const event = events.find((e) => e.id === lot.event_id)
        if (event) {
          category = event.category
        }
      }
    }

    const existing = categoryMap.get(category) ?? { profit: 0, count: 0 }
    existing.profit += (sale.sale_price_total || 0) - (sale.fees || 0)
    existing.count += 1
    categoryMap.set(category, existing)
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    profit: Math.round(data.profit * 100) / 100,
    count: data.count,
  }))
}

function buildRecentActivity(sales: SaleRow[], events: EventRow[]): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Add recent sales
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  for (const sale of recentSales) {
    activities.push({
      id: sale.id,
      type: 'sale',
      description: `Vente${sale.buyer_name ? ` a ${sale.buyer_name}` : ''}`,
      amount: sale.sale_price_total,
      created_at: sale.created_at,
    })
  }

  // Add recent events
  for (const event of events) {
    activities.push({
      id: event.id,
      type: 'event_created',
      description: `Evenement cree: ${event.name}`,
      amount: null,
      created_at: event.created_at,
    })
  }

  // Sort by date and take 10 most recent
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
}
