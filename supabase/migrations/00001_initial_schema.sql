-- ============================================================================
-- Migration: 00001_initial_schema.sql
-- Description: Initial schema for the resale management application
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TRIGGER FUNCTION: update_updated_at
-- Auto-updates the updated_at column on every UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLE: profiles (extends auth.users)
-- ============================================================================

CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    language text DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    theme text DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    business_name text,
    business_address text,
    business_siret text,
    tax_regime text DEFAULT 'auto-entrepreneur',
    tax_rate numeric(5,2) DEFAULT 20.00,
    currency text DEFAULT 'EUR',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 3. TABLE: folders
-- ============================================================================

CREATE TABLE public.folders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text DEFAULT '#7c3aed',
    icon text,
    parent_id uuid REFERENCES public.folders(id) ON DELETE SET NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 4. TABLE: events
-- ============================================================================

CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    venue text,
    city text,
    country text DEFAULT 'FR',
    event_date timestamptz,
    event_end_date timestamptz,
    category text CHECK (category IN ('concert', 'football', 'tennis', 'rugby', 'other')),
    status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    image_url text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 5. TABLE: tm_accounts (created BEFORE ticket_lots due to FK dependency)
-- ============================================================================

CREATE TABLE public.tm_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email text NOT NULL,
    encrypted_password text NOT NULL,
    display_name text,
    phone text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'unknown')),
    last_checked timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_tm_accounts_updated_at
    BEFORE UPDATE ON public.tm_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 6. TABLE: ticket_lots
-- ============================================================================

CREATE TABLE public.ticket_lots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    tm_account_id uuid REFERENCES public.tm_accounts(id) ON DELETE SET NULL,
    section text,
    "row" text,
    seat_numbers text,
    ticket_type text DEFAULT 'e-ticket' CHECK (ticket_type IN ('mobile', 'e-ticket', 'physical')),
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    purchase_price_unit numeric(10,2) NOT NULL,
    purchase_price_total numeric(10,2) GENERATED ALWAYS AS (quantity * purchase_price_unit) STORED,
    purchase_date date,
    purchase_platform text,
    face_value numeric(10,2),
    transfer_status text DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'transferred', 'not_needed')),
    status text DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'listed', 'sold', 'transferred', 'cancelled')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_ticket_lots_updated_at
    BEFORE UPDATE ON public.ticket_lots
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 7. TABLE: products
-- ============================================================================

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    category text CHECK (category IN ('sneakers', 'clothing', 'electronics', 'collectibles', 'accessories', 'other')),
    brand text,
    size text,
    condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    purchase_price numeric(10,2),
    purchase_date date,
    purchase_source text,
    listing_price numeric(10,2),
    quantity integer DEFAULT 1,
    status text DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'listed', 'sold', 'shipped', 'returned')),
    image_urls text[],
    sku text,
    vinted_url text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 8. TABLE: sales
-- ============================================================================

CREATE TABLE public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_lot_id uuid REFERENCES public.ticket_lots(id) ON DELETE SET NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    sale_platform text,
    quantity_sold integer NOT NULL DEFAULT 1,
    sale_price_unit numeric(10,2) NOT NULL,
    sale_price_total numeric(10,2) GENERATED ALWAYS AS (quantity_sold * sale_price_unit) STORED,
    fees numeric(10,2) DEFAULT 0,
    shipping_cost numeric(10,2) DEFAULT 0,
    sale_date date DEFAULT CURRENT_DATE,
    buyer_name text,
    buyer_email text,
    tracking_number text,
    status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_sales_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 9. TABLE: calendar_events
-- ============================================================================

CREATE TABLE public.calendar_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    all_day boolean DEFAULT false,
    color text DEFAULT '#7c3aed',
    category text CHECK (category IN ('event', 'deadline', 'billetterie', 'reminder', 'other')),
    linked_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
    linked_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    recurrence_rule text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 10. TABLE: subscriptions (created BEFORE treasury_entries due to FK dependency)
-- ============================================================================

CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    amount numeric(10,2) NOT NULL,
    billing_cycle text CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    next_billing_date date,
    category text,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 11. TABLE: treasury_entries
-- ============================================================================

CREATE TABLE public.treasury_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    category text,
    amount numeric(10,2) NOT NULL,
    description text,
    entry_date date NOT NULL DEFAULT CURRENT_DATE,
    linked_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    linked_subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    payment_method text,
    is_recurring boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_treasury_entries_updated_at
    BEFORE UPDATE ON public.treasury_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 12. TABLE: invoices
-- ============================================================================

CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number text NOT NULL,
    linked_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    buyer_name text,
    buyer_address text,
    buyer_email text,
    items jsonb NOT NULL DEFAULT '[]',
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    tax_rate numeric(5,2),
    tax_amount numeric(10,2),
    total numeric(10,2) NOT NULL DEFAULT 0,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date date DEFAULT CURRENT_DATE,
    due_date date,
    pdf_url text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 13. TABLE: parcels
-- ============================================================================

CREATE TABLE public.parcels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracking_number text NOT NULL,
    carrier text,
    linked_sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
    linked_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
    linked_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    recipient_name text,
    destination text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned')),
    last_status_update timestamptz,
    estimated_delivery date,
    status_history jsonb DEFAULT '[]',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_parcels_updated_at
    BEFORE UPDATE ON public.parcels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 14. TABLE: todos
-- ============================================================================

CREATE TABLE public.todos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date timestamptz,
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_completed boolean DEFAULT false,
    completed_at timestamptz,
    linked_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
    linked_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 15. TABLE: alerts
-- ============================================================================

CREATE TABLE public.alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('billetterie_opening', 'presale', 'transfer_reminder', 'payment_reminder', 'price_drop', 'custom')),
    conditions jsonb DEFAULT '{}',
    discord_webhook_url text,
    is_active boolean DEFAULT true,
    check_interval_minutes integer DEFAULT 60,
    last_triggered timestamptz,
    notification_channels text[] DEFAULT '{in_app}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- 16. TABLE: user_settings
-- ============================================================================

CREATE TABLE public.user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_email boolean DEFAULT true,
    notification_in_app boolean DEFAULT true,
    default_currency text DEFAULT 'EUR',
    date_format text DEFAULT 'DD/MM/YYYY',
    default_event_view text DEFAULT 'list' CHECK (default_event_view IN ('list', 'card', 'bubble')),
    visible_event_columns text[] DEFAULT '{name,date,venue,status,tickets,profit}',
    discord_global_webhook text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- TRIGGER FUNCTION: handle_new_user
-- Creates a profile row and user_settings row when a new auth user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
    );

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER FUNCTION: generate_invoice_number
-- Auto-generates invoice numbers in 'INV-YYYY-NNNN' format
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year text;
    next_number integer;
BEGIN
    current_year := to_char(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'INV-' || current_year || '-(\d+)') AS integer)
    ), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || current_year || '-%'
      AND user_id = NEW.user_id;

    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := 'INV-' || current_year || '-' || LPAD(next_number::text, 4, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoices_generate_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- ============================================================================
-- ROW LEVEL SECURITY: Enable RLS on all tables
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: profiles (uses id instead of user_id)
-- ============================================================================

CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: folders
-- ============================================================================

CREATE POLICY "folders_select" ON public.folders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "folders_insert" ON public.folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_update" ON public.folders
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_delete" ON public.folders
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: events
-- ============================================================================

CREATE POLICY "events_select" ON public.events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "events_insert" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update" ON public.events
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_delete" ON public.events
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: tm_accounts
-- ============================================================================

CREATE POLICY "tm_accounts_select" ON public.tm_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tm_accounts_insert" ON public.tm_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tm_accounts_update" ON public.tm_accounts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tm_accounts_delete" ON public.tm_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: ticket_lots
-- ============================================================================

CREATE POLICY "ticket_lots_select" ON public.ticket_lots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ticket_lots_insert" ON public.ticket_lots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ticket_lots_update" ON public.ticket_lots
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ticket_lots_delete" ON public.ticket_lots
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: products
-- ============================================================================

CREATE POLICY "products_select" ON public.products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_insert" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update" ON public.products
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_delete" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: sales
-- ============================================================================

CREATE POLICY "sales_select" ON public.sales
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sales_insert" ON public.sales
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sales_update" ON public.sales
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sales_delete" ON public.sales
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: calendar_events
-- ============================================================================

CREATE POLICY "calendar_events_select" ON public.calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "calendar_events_insert" ON public.calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_events_update" ON public.calendar_events
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calendar_events_delete" ON public.calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: subscriptions
-- ============================================================================

CREATE POLICY "subscriptions_select" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_delete" ON public.subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: treasury_entries
-- ============================================================================

CREATE POLICY "treasury_entries_select" ON public.treasury_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "treasury_entries_insert" ON public.treasury_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "treasury_entries_update" ON public.treasury_entries
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "treasury_entries_delete" ON public.treasury_entries
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: invoices
-- ============================================================================

CREATE POLICY "invoices_select" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update" ON public.invoices
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_delete" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: parcels
-- ============================================================================

CREATE POLICY "parcels_select" ON public.parcels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "parcels_insert" ON public.parcels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "parcels_update" ON public.parcels
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "parcels_delete" ON public.parcels
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: todos
-- ============================================================================

CREATE POLICY "todos_select" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "todos_insert" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos_update" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos_delete" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: alerts
-- ============================================================================

CREATE POLICY "alerts_select" ON public.alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "alerts_insert" ON public.alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_update" ON public.alerts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_delete" ON public.alerts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: user_settings
-- ============================================================================

CREATE POLICY "user_settings_select" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_delete" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES: user_id columns (all tables)
-- ============================================================================

CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_tm_accounts_user_id ON public.tm_accounts(user_id);
CREATE INDEX idx_ticket_lots_user_id ON public.ticket_lots(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_sales_user_id ON public.sales(user_id);
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_treasury_entries_user_id ON public.treasury_entries(user_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_parcels_user_id ON public.parcels(user_id);
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================================================
-- INDEXES: foreign key columns
-- ============================================================================

CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_events_folder_id ON public.events(folder_id);
CREATE INDEX idx_ticket_lots_event_id ON public.ticket_lots(event_id);
CREATE INDEX idx_ticket_lots_tm_account_id ON public.ticket_lots(tm_account_id);
CREATE INDEX idx_products_folder_id ON public.products(folder_id);
CREATE INDEX idx_sales_ticket_lot_id ON public.sales(ticket_lot_id);
CREATE INDEX idx_sales_product_id ON public.sales(product_id);
CREATE INDEX idx_calendar_events_linked_event_id ON public.calendar_events(linked_event_id);
CREATE INDEX idx_calendar_events_linked_product_id ON public.calendar_events(linked_product_id);
CREATE INDEX idx_treasury_entries_linked_sale_id ON public.treasury_entries(linked_sale_id);
CREATE INDEX idx_treasury_entries_linked_subscription_id ON public.treasury_entries(linked_subscription_id);
CREATE INDEX idx_invoices_linked_sale_id ON public.invoices(linked_sale_id);
CREATE INDEX idx_parcels_linked_sale_id ON public.parcels(linked_sale_id);
CREATE INDEX idx_parcels_linked_event_id ON public.parcels(linked_event_id);
CREATE INDEX idx_parcels_linked_product_id ON public.parcels(linked_product_id);
CREATE INDEX idx_todos_linked_event_id ON public.todos(linked_event_id);
CREATE INDEX idx_todos_linked_product_id ON public.todos(linked_product_id);

-- ============================================================================
-- INDEXES: status columns
-- ============================================================================

CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_ticket_lots_status ON public.ticket_lots(status);
CREATE INDEX idx_ticket_lots_transfer_status ON public.ticket_lots(transfer_status);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_sales_status ON public.sales(status);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_parcels_status ON public.parcels(status);
CREATE INDEX idx_tm_accounts_status ON public.tm_accounts(status);
CREATE INDEX idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX idx_alerts_is_active ON public.alerts(is_active);
CREATE INDEX idx_todos_is_completed ON public.todos(is_completed);

-- ============================================================================
-- INDEXES: date columns (frequently queried)
-- ============================================================================

CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_ticket_lots_purchase_date ON public.ticket_lots(purchase_date);
CREATE INDEX idx_products_purchase_date ON public.products(purchase_date);
CREATE INDEX idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX idx_treasury_entries_entry_date ON public.treasury_entries(entry_date);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date);
CREATE INDEX idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
CREATE INDEX idx_parcels_estimated_delivery ON public.parcels(estimated_delivery);

-- ============================================================================
-- INDEXES: other frequently queried columns
-- ============================================================================

CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_parcels_tracking_number ON public.parcels(tracking_number);
CREATE INDEX idx_treasury_entries_type ON public.treasury_entries(type);
CREATE INDEX idx_alerts_type ON public.alerts(type);
CREATE INDEX idx_todos_priority ON public.todos(priority);
