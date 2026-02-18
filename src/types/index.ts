export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  language: 'fr' | 'en'
  theme: 'dark' | 'light'
  business_name: string | null
  business_address: string | null
  business_siret: string | null
  tax_regime: string | null
  tax_rate: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  children?: Folder[]
}

export interface Event {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  description: string | null
  venue: string | null
  city: string | null
  country: string
  event_date: string | null
  event_end_date: string | null
  category: 'concert' | 'football' | 'tennis' | 'rugby' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  ticket_lots?: TicketLot[]
  sales?: Sale[]
  _count?: { ticket_lots: number; sales: number }
  _totals?: { invested: number; revenue: number; profit: number }
}

export interface TicketLot {
  id: string
  user_id: string
  event_id: string
  tm_account_id: string | null
  section: string | null
  row: string | null
  seat_numbers: string | null
  ticket_type: 'mobile' | 'e-ticket' | 'physical'
  quantity: number
  purchase_price_unit: number
  purchase_price_total: number
  purchase_date: string | null
  purchase_platform: string | null
  face_value: number | null
  transfer_status: 'pending' | 'transferred' | 'not_needed'
  status: 'in_stock' | 'listed' | 'sold' | 'transferred' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  event?: Event
  tm_account?: TmAccount
  sales?: Sale[]
}

export interface Sale {
  id: string
  user_id: string
  ticket_lot_id: string | null
  product_id: string | null
  sale_platform: string | null
  quantity_sold: number
  sale_price_unit: number
  sale_price_total: number
  fees: number
  shipping_cost: number
  sale_date: string
  buyer_name: string | null
  buyer_email: string | null
  tracking_number: string | null
  status: 'pending' | 'completed' | 'refunded' | 'disputed'
  notes: string | null
  created_at: string
  updated_at: string
  ticket_lot?: TicketLot
  product?: Product
}

export interface Product {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  description: string | null
  category: 'sneakers' | 'clothing' | 'electronics' | 'collectibles' | 'accessories' | 'other'
  brand: string | null
  size: string | null
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null
  purchase_price: number | null
  purchase_date: string | null
  purchase_source: string | null
  listing_price: number | null
  quantity: number
  status: 'in_stock' | 'listed' | 'sold' | 'shipped' | 'returned'
  image_urls: string[] | null
  sku: string | null
  vinted_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  sales?: Sale[]
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  all_day: boolean
  color: string
  category: 'event' | 'deadline' | 'billetterie' | 'reminder' | 'other'
  linked_event_id: string | null
  linked_product_id: string | null
  recurrence_rule: string | null
  created_at: string
  updated_at: string
  linked_event?: Event
  linked_product?: Product
}

export interface TreasuryEntry {
  id: string
  user_id: string
  type: 'income' | 'expense'
  category: string | null
  amount: number
  description: string | null
  entry_date: string
  linked_sale_id: string | null
  linked_subscription_id: string | null
  payment_method: string | null
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  billing_cycle: 'monthly' | 'quarterly' | 'yearly'
  next_billing_date: string | null
  category: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  linked_sale_id: string | null
  buyer_name: string | null
  buyer_address: string | null
  buyer_email: string | null
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number | null
  tax_amount: number | null
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string | null
  pdf_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface TmAccount {
  id: string
  user_id: string
  email: string
  encrypted_password: string
  display_name: string | null
  phone: string | null
  status: 'active' | 'suspended' | 'banned' | 'unknown'
  last_checked: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Parcel {
  id: string
  user_id: string
  tracking_number: string
  carrier: string | null
  linked_sale_id: string | null
  linked_event_id: string | null
  linked_product_id: string | null
  recipient_name: string | null
  destination: string | null
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned'
  last_status_update: string | null
  estimated_delivery: string | null
  status_history: ParcelStatusEntry[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ParcelStatusEntry {
  status: string
  timestamp: string
  location: string | null
  description: string | null
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_completed: boolean
  completed_at: string | null
  linked_event_id: string | null
  linked_product_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
  linked_event?: Event
  linked_product?: Product
}

export interface Alert {
  id: string
  user_id: string
  name: string
  type: 'billetterie_opening' | 'presale' | 'transfer_reminder' | 'payment_reminder' | 'price_drop' | 'custom'
  conditions: Record<string, unknown>
  discord_webhook_url: string | null
  is_active: boolean
  check_interval_minutes: number
  last_triggered: string | null
  notification_channels: string[]
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  notification_email: boolean
  notification_in_app: boolean
  default_currency: string
  date_format: string
  default_event_view: 'list' | 'card' | 'bubble'
  visible_event_columns: string[]
  discord_global_webhook: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_invested: number
  total_revenue: number
  total_profit: number
  roi_percentage: number
  tickets_in_stock: number
  products_in_stock: number
  monthly_data: MonthlyData[]
  category_data: CategoryData[]
  recent_activity: ActivityItem[]
}

export interface MonthlyData {
  month: string
  revenue: number
  costs: number
  profit: number
}

export interface CategoryData {
  category: string
  profit: number
  count: number
}

export interface ActivityItem {
  id: string
  type: 'sale' | 'purchase' | 'event_created' | 'product_added'
  description: string
  amount: number | null
  created_at: string
}
