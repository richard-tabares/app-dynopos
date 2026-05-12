-- ============================================
-- MIGRATION: Convert BIGINT IDs to UUID
-- Fecha: 2026-05-11
-- Descripción: Cambia todas las PKs y FKs de
--   BIGINT auto-increment a UUID, renombrando
--   profile_id → id en profiles.
-- ============================================

-- ============================================
-- FASE 0: Eliminar objetos dependientes
-- ============================================

-- 0a. Vistas
DROP VIEW IF EXISTS public.vw_sales_history CASCADE;
DROP VIEW IF EXISTS public.vw_top_products CASCADE;
DROP VIEW IF EXISTS public.vw_bottom_products CASCADE;
DROP VIEW IF EXISTS public.vw_daily_sales CASCADE;
DROP VIEW IF EXISTS public.vw_avg_ticket CASCADE;
DROP VIEW IF EXISTS public.vw_inventory_valuation CASCADE;
DROP VIEW IF EXISTS public.vw_product_performance CASCADE;
DROP VIEW IF EXISTS public.vw_returns_list CASCADE;
DROP VIEW IF EXISTS public.vw_returns_summary CASCADE;
DROP VIEW IF EXISTS public.vw_sales_by_category CASCADE;
DROP VIEW IF EXISTS public.vw_sales_by_payment CASCADE;
DROP VIEW IF EXISTS public.vw_stock_status CASCADE;

-- 0b. Trigger y función
DROP TRIGGER IF EXISTS on_product_created ON public.products;
DROP FUNCTION IF EXISTS public.handle_new_product_inventory;

-- 0c. RLS policies (se recrean al final)
DROP POLICY IF EXISTS "User can view item sales" ON public."salesItems";
DROP POLICY IF EXISTS "Users can do ALL" ON public.businesses;
DROP POLICY IF EXISTS "Users can do ALL" ON public.categories;
DROP POLICY IF EXISTS "Users can do ALL" ON public.inventory;
DROP POLICY IF EXISTS "Users can do ALL" ON public.inventory_movements;
DROP POLICY IF EXISTS "Users can do ALL" ON public.products;
DROP POLICY IF EXISTS "Users can do ALL" ON public.profiles;
DROP POLICY IF EXISTS "Users can do ALL" ON public.returns;
DROP POLICY IF EXISTS "Users can do ALL" ON public."salesTickets";
DROP POLICY IF EXISTS "Users can insert data" ON public.returns_items;
DROP POLICY IF EXISTS "Users can insert data" ON public."salesItems";
DROP POLICY IF EXISTS "user can view returns" ON public.returns_items;

-- 0d. Foreign Keys
ALTER TABLE ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE ONLY public.products DROP CONSTRAINT IF EXISTS products_business_id_fkey;
ALTER TABLE ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_product_id_fkey;
ALTER TABLE ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_business_id_fkey;
ALTER TABLE ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS "inventoryMovements_product_id_fkey";
ALTER TABLE ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_business_id_fkey;
ALTER TABLE ONLY public.returns DROP CONSTRAINT IF EXISTS returns_sale_id_fkey;
ALTER TABLE ONLY public.returns DROP CONSTRAINT IF EXISTS returns_business_id_fkey;
ALTER TABLE ONLY public.returns_items DROP CONSTRAINT IF EXISTS returns_items_product_id_fkey;
ALTER TABLE ONLY public.returns_items DROP CONSTRAINT IF EXISTS returns_items_return_id_fkey;
ALTER TABLE ONLY public."salesItems" DROP CONSTRAINT IF EXISTS "salesItems_product_id_fkey";
ALTER TABLE ONLY public."salesItems" DROP CONSTRAINT IF EXISTS "salesItems_sale_id_fkey";
ALTER TABLE ONLY public."salesTickets" DROP CONSTRAINT IF EXISTS "salesTickets_business_id_fkey";
ALTER TABLE ONLY public.categories DROP CONSTRAINT IF EXISTS categories_business_id_fkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- ============================================
-- FASE 1: Tablas padre (sin FK hacia otras)
-- ============================================

-- 1a. categories: id BIGINT → UUID
ALTER TABLE public.categories ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
CREATE TEMP TABLE categories_map AS SELECT id AS old_id, id_uuid AS new_id FROM public.categories;
ALTER TABLE public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE public.categories DROP COLUMN id;
ALTER TABLE public.categories RENAME COLUMN id_uuid TO id;
ALTER TABLE public.categories ADD PRIMARY KEY (id);

-- 1b. salesTickets: id BIGINT → UUID
ALTER TABLE public."salesTickets" ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
CREATE TEMP TABLE salesTickets_map AS SELECT id AS old_id, id_uuid AS new_id FROM public."salesTickets";
ALTER TABLE public."salesTickets" DROP CONSTRAINT "salesTickets_pkey";
ALTER TABLE public."salesTickets" DROP COLUMN id;
ALTER TABLE public."salesTickets" RENAME COLUMN id_uuid TO id;
ALTER TABLE public."salesTickets" ADD PRIMARY KEY (id);

-- 1c. products: id BIGINT → UUID, category_id BIGINT → UUID
ALTER TABLE public.products ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.products ADD COLUMN category_id_uuid UUID;
UPDATE public.products p SET category_id_uuid = m.new_id
FROM categories_map m WHERE m.old_id = p.category_id;
CREATE TEMP TABLE products_map AS SELECT id AS old_id, id_uuid AS new_id FROM public.products;
ALTER TABLE public.products DROP CONSTRAINT products_pkey;
ALTER TABLE public.products DROP COLUMN id;
ALTER TABLE public.products DROP COLUMN category_id;
ALTER TABLE public.products RENAME COLUMN id_uuid TO id;
ALTER TABLE public.products RENAME COLUMN category_id_uuid TO category_id;
ALTER TABLE public.products ADD PRIMARY KEY (id);

-- 1d. returns: id BIGINT → UUID, sale_id BIGINT → UUID
ALTER TABLE public.returns ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.returns ADD COLUMN sale_id_uuid UUID;
UPDATE public.returns r SET sale_id_uuid = m.new_id
FROM salesTickets_map m WHERE m.old_id = r.sale_id;
CREATE TEMP TABLE returns_map AS SELECT id AS old_id, id_uuid AS new_id FROM public.returns;
ALTER TABLE public.returns DROP CONSTRAINT returns_pkey;
ALTER TABLE public.returns DROP COLUMN id;
ALTER TABLE public.returns DROP COLUMN sale_id;
ALTER TABLE public.returns RENAME COLUMN id_uuid TO id;
ALTER TABLE public.returns RENAME COLUMN sale_id_uuid TO sale_id;
ALTER TABLE public.returns ADD PRIMARY KEY (id);

-- 1e. profiles: profile_id BIGINT → renombrar a id UUID
ALTER TABLE public.profiles ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE public.profiles DROP COLUMN profile_id;
ALTER TABLE public.profiles RENAME COLUMN id_uuid TO id;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- ============================================
-- FASE 2: Tablas hoja (PK propia + FKs)
-- ============================================

-- 2a. inventory: id BIGINT → UUID, product_id BIGINT → UUID
ALTER TABLE public.inventory ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.inventory ADD COLUMN product_id_uuid UUID;
UPDATE public.inventory i SET product_id_uuid = m.new_id
FROM products_map m WHERE m.old_id = i.product_id;
ALTER TABLE public.inventory DROP CONSTRAINT inventory_pkey;
ALTER TABLE public.inventory DROP COLUMN id;
ALTER TABLE public.inventory DROP COLUMN product_id;
ALTER TABLE public.inventory RENAME COLUMN id_uuid TO id;
ALTER TABLE public.inventory RENAME COLUMN product_id_uuid TO product_id;
ALTER TABLE public.inventory ADD PRIMARY KEY (id);

-- 2b. inventory_movements: id BIGINT → UUID, product_id BIGINT → UUID
ALTER TABLE public.inventory_movements ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.inventory_movements ADD COLUMN product_id_uuid UUID;
UPDATE public.inventory_movements im SET product_id_uuid = m.new_id
FROM products_map m WHERE m.old_id = im.product_id;
ALTER TABLE public.inventory_movements DROP CONSTRAINT "inventoryMovements_pkey";
ALTER TABLE public.inventory_movements DROP COLUMN id;
ALTER TABLE public.inventory_movements DROP COLUMN product_id;
ALTER TABLE public.inventory_movements RENAME COLUMN id_uuid TO id;
ALTER TABLE public.inventory_movements RENAME COLUMN product_id_uuid TO product_id;
ALTER TABLE public.inventory_movements ADD PRIMARY KEY (id);

-- 2c. returns_items: id BIGINT → UUID, return_id BIGINT → UUID, product_id BIGINT → UUID
ALTER TABLE public.returns_items ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public.returns_items ADD COLUMN return_id_uuid UUID;
ALTER TABLE public.returns_items ADD COLUMN product_id_uuid UUID;
UPDATE public.returns_items ri SET return_id_uuid = m.new_id
FROM returns_map m WHERE m.old_id = ri.return_id;
UPDATE public.returns_items ri SET product_id_uuid = m.new_id
FROM products_map m WHERE m.old_id = ri.product_id;
ALTER TABLE public.returns_items DROP CONSTRAINT returns_items_pkey;
ALTER TABLE public.returns_items DROP COLUMN id;
ALTER TABLE public.returns_items DROP COLUMN return_id;
ALTER TABLE public.returns_items DROP COLUMN product_id;
ALTER TABLE public.returns_items RENAME COLUMN id_uuid TO id;
ALTER TABLE public.returns_items RENAME COLUMN return_id_uuid TO return_id;
ALTER TABLE public.returns_items RENAME COLUMN product_id_uuid TO product_id;
ALTER TABLE public.returns_items ADD PRIMARY KEY (id);

-- 2d. salesItems: id BIGINT → UUID, sale_id BIGINT → UUID, product_id BIGINT → UUID
ALTER TABLE public."salesItems" ADD COLUMN id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE public."salesItems" ADD COLUMN sale_id_uuid UUID;
ALTER TABLE public."salesItems" ADD COLUMN product_id_uuid UUID;
UPDATE public."salesItems" si SET sale_id_uuid = m.new_id
FROM salesTickets_map m WHERE m.old_id = si.sale_id;
UPDATE public."salesItems" si SET product_id_uuid = m.new_id
FROM products_map m WHERE m.old_id = si.product_id;
ALTER TABLE public."salesItems" DROP CONSTRAINT "salesItems_pkey";
ALTER TABLE public."salesItems" DROP COLUMN id;
ALTER TABLE public."salesItems" DROP COLUMN sale_id;
ALTER TABLE public."salesItems" DROP COLUMN product_id;
ALTER TABLE public."salesItems" RENAME COLUMN id_uuid TO id;
ALTER TABLE public."salesItems" RENAME COLUMN sale_id_uuid TO sale_id;
ALTER TABLE public."salesItems" RENAME COLUMN product_id_uuid TO product_id;
ALTER TABLE public."salesItems" ADD PRIMARY KEY (id);

-- ============================================
-- FASE 3: Recrear Foreign Keys
-- ============================================

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id)
    ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id)
    ON UPDATE CASCADE;

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventoryMovements_product_id_fkey"
    FOREIGN KEY (product_id) REFERENCES public.products(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_sale_id_fkey
    FOREIGN KEY (sale_id) REFERENCES public."salesTickets"(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.returns_items
    ADD CONSTRAINT returns_items_return_id_fkey
    FOREIGN KEY (return_id) REFERENCES public.returns(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.returns_items
    ADD CONSTRAINT returns_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."salesItems"
    ADD CONSTRAINT "salesItems_sale_id_fkey"
    FOREIGN KEY (sale_id) REFERENCES public."salesTickets"(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."salesItems"
    ADD CONSTRAINT "salesItems_product_id_fkey"
    FOREIGN KEY (product_id) REFERENCES public.products(id)
    ON UPDATE CASCADE;

ALTER TABLE ONLY public."salesTickets"
    ADD CONSTRAINT "salesTickets_business_id_fkey"
    FOREIGN KEY (business_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================
-- FASE 4: Recrear trigger de inventario
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.inventory (product_id, business_id, stock, min_stock)
    VALUES (NEW.id, NEW.business_id, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_created
    AFTER INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_product_inventory();

-- ============================================
-- FASE 5: Recrear vistas
-- ============================================

CREATE OR REPLACE VIEW public.vw_sales_history WITH (security_invoker = true) AS
SELECT
    st.id,
    st.total_amount,
    st.created_at,
    st.payment_method,
    st.status,
    st.business_id,
    jsonb_agg(
        jsonb_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'quantity', si.quantity,
            'price', si.unit_price,
            'subtotal', si.subtotal,
            'name', COALESCE(p.name, 'Producto eliminado')
        )
        ORDER BY si.id
    ) AS items,
    SUM(si.quantity)::int AS items_count
FROM public."salesTickets" st
JOIN public."salesItems" si ON si.sale_id = st.id
LEFT JOIN public.products p ON p.id = si.product_id
GROUP BY st.id;

CREATE OR REPLACE VIEW public.vw_top_products WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    SUM(si.quantity)::int AS total_quantity_sold,
    SUM(si.subtotal)::bigint AS total_revenue
FROM public."salesItems" si
JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
JOIN public.products p ON p.id = si.product_id
GROUP BY p.business_id, p.id, p.name;

CREATE OR REPLACE VIEW public.vw_bottom_products WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    COALESCE(SUM(si.quantity), 0)::int AS total_quantity_sold,
    COALESCE(SUM(si.subtotal), 0)::bigint AS total_revenue
FROM public.products p
LEFT JOIN public."salesItems" si ON si.product_id = p.id
LEFT JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
WHERE p.is_active = true
GROUP BY p.business_id, p.id, p.name;

CREATE OR REPLACE VIEW public.vw_daily_sales WITH (security_invoker = on) AS
SELECT
    business_id,
    created_at AS sale_date,
    COUNT(id)::int AS sale_count,
    SUM(total_amount)::bigint AS total_amount
FROM public."salesTickets" st
WHERE status::text <> 'returned'::text
GROUP BY business_id, created_at;

CREATE OR REPLACE VIEW public.vw_avg_ticket WITH (security_invoker = on) AS
SELECT
    business_id,
    created_at AS sale_date,
    COUNT(id)::int AS sale_count,
    SUM(total_amount)::bigint AS total_amount,
    (SUM(total_amount) / NULLIF(COUNT(id), 0)::numeric)::bigint AS avg_ticket
FROM public."salesTickets" st
WHERE status::text <> 'returned'::text
GROUP BY business_id, created_at;

CREATE OR REPLACE VIEW public.vw_inventory_valuation WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    COALESCE(i.stock, 0)::int AS current_stock,
    p.unit_cost::bigint AS unit_cost,
    (COALESCE(i.stock, 0)::numeric * p.unit_cost)::bigint AS total_value
FROM public.products p
LEFT JOIN public.inventory i ON i.product_id = p.id
WHERE p.is_active = true AND p.track_stock = true;

CREATE OR REPLACE VIEW public.vw_product_performance WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    COALESCE(SUM(si.quantity), 0)::int AS total_quantity_sold,
    COALESCE(SUM(si.subtotal), 0)::bigint AS total_revenue,
    COALESCE(i.stock, 0)::int AS current_stock,
    COALESCE(i.min_stock, 0)::int AS min_stock,
    p.price::bigint AS unit_price,
    p.track_stock
FROM public.products p
LEFT JOIN public."salesItems" si ON si.product_id = p.id
LEFT JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
LEFT JOIN public.inventory i ON i.product_id = p.id
WHERE p.is_active = true
GROUP BY p.business_id, p.id, p.name, p.sku, i.stock, i.min_stock, p.price, p.track_stock;

CREATE OR REPLACE VIEW public.vw_returns_list WITH (security_invoker = on) AS
SELECT
    r.id AS return_id,
    r.business_id,
    r.reason,
    r.total_amount,
    r.created_at AS return_date,
    COALESCE(ri.total_items, 0) AS total_items_returned
FROM public.returns r
LEFT JOIN (
    SELECT return_id, SUM(quantity)::int AS total_items
    FROM public.returns_items
    GROUP BY return_id
) ri ON ri.return_id = r.id;

CREATE OR REPLACE VIEW public.vw_returns_summary WITH (security_invoker = on) AS
SELECT
    r.business_id,
    r.created_at AS return_date,
    COUNT(r.id)::int AS return_count,
    SUM(r.total_amount)::bigint AS total_amount,
    SUM(ri.quantity)::int AS total_items_returned
FROM public.returns r
JOIN public.returns_items ri ON ri.return_id = r.id
GROUP BY r.business_id, r.created_at;

CREATE OR REPLACE VIEW public.vw_sales_by_category WITH (security_invoker = on) AS
SELECT
    p.business_id,
    c.id AS category_id,
    c.name AS category_name,
    st.created_at AS sale_date,
    COUNT(DISTINCT st.id)::int AS sale_count,
    SUM(si.subtotal)::bigint AS total_amount,
    SUM(si.quantity)::int AS total_quantity
FROM public."salesItems" si
JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
JOIN public.products p ON p.id = si.product_id
JOIN public.categories c ON c.id = p.category_id
GROUP BY p.business_id, c.id, c.name, st.created_at;

CREATE OR REPLACE VIEW public.vw_sales_by_payment WITH (security_invoker = on) AS
SELECT
    business_id,
    payment_method,
    created_at AS sale_date,
    COUNT(id)::int AS sale_count,
    SUM(total_amount)::bigint AS total_amount
FROM public."salesTickets" st
WHERE status::text <> 'returned'::text
GROUP BY business_id, payment_method, created_at;

CREATE OR REPLACE VIEW public.vw_stock_status WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.unit_cost,
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(i.stock, 0)::int AS current_stock,
    COALESCE(i.min_stock, 0)::int AS min_stock,
    p.track_stock,
    CASE
        WHEN p.track_stock = false THEN 'sin_control'::text
        WHEN COALESCE(i.stock, 0) <= 0 THEN 'sin_stock'::text
        WHEN COALESCE(i.stock, 0) <= COALESCE(i.min_stock, 0)
             AND COALESCE(i.min_stock, 0) > 0 THEN 'stock_bajo'::text
        ELSE 'con_stock'::text
    END AS stock_status
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.inventory i ON i.product_id = p.id
WHERE p.is_active = true;

-- ============================================
-- FASE 6: Recrear índices
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_business ON public.inventory USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_product ON public.inventory_movements USING btree (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_mov_business ON public.inventory_movements USING btree (business_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_name ON public.products USING btree (business_id, name);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products USING btree (sku);
CREATE INDEX IF NOT EXISTS idx_returns_business_date ON public.returns USING btree (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_salesitems_product ON public."salesItems" USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_salesitems_sale ON public."salesItems" USING btree (sale_id);
CREATE INDEX IF NOT EXISTS idx_salestickets_business_date ON public."salesTickets" USING btree (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_salestickets_business_id ON public."salesTickets" USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_salestickets_status ON public."salesTickets" USING btree (status);

-- ============================================
-- FASE 7: Recrear RLS policies
-- ============================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."salesItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."salesTickets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can do ALL" ON public.businesses
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can do ALL" ON public.categories
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can do ALL" ON public.inventory
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can do ALL" ON public.inventory_movements
    USING (business_id = auth.uid())
    WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can do ALL" ON public.products
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can do ALL" ON public.profiles
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can do ALL" ON public.returns
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can do ALL" ON public."salesTickets"
    USING (auth.uid() = business_id)
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can insert data" ON public.returns_items
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT returns.business_id FROM public.returns WHERE returns.id = return_id));

CREATE POLICY "user can view returns" ON public.returns_items
    FOR SELECT
    USING (auth.uid() = (SELECT returns.business_id FROM public.returns WHERE returns.id = return_id));

CREATE POLICY "User can view item sales" ON public."salesItems"
    FOR SELECT
    USING (auth.uid() = (SELECT "salesTickets".business_id FROM public."salesTickets" WHERE "salesTickets".id = sale_id));

CREATE POLICY "Users can insert data" ON public."salesItems"
    FOR INSERT
    WITH CHECK (auth.uid() = (SELECT "salesTickets".business_id FROM public."salesTickets" WHERE "salesTickets".id = sale_id));

-- ============================================
-- FASE 8: Limpiar tablas temporales
-- ============================================

DROP TABLE IF EXISTS categories_map;
DROP TABLE IF EXISTS salesTickets_map;
DROP TABLE IF EXISTS products_map;
DROP TABLE IF EXISTS returns_map;
