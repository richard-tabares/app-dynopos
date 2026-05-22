DROP VIEW IF EXISTS public.vw_inventory_valuation CASCADE;
DROP VIEW IF EXISTS public.vw_product_performance CASCADE;
DROP VIEW IF EXISTS public.vw_stock_status CASCADE;

CREATE OR REPLACE VIEW public.vw_stock_status WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.barcode,
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

CREATE OR REPLACE VIEW public.vw_inventory_valuation WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.barcode,
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
    p.barcode,
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
GROUP BY p.business_id, p.id, p.name, p.sku, p.barcode, i.stock, i.min_stock, p.price, p.track_stock;
