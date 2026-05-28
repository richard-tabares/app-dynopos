-- Update vw_top_products and vw_bottom_products to include variation data
-- When a product has variations, show "Product - Variation" name per variation row
DROP VIEW IF EXISTS public.vw_top_products;
DROP VIEW IF EXISTS public.vw_bottom_products;
CREATE OR REPLACE VIEW public.vw_top_products WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    si.variation_id,
    CASE
        WHEN si.variation_id IS NOT NULL THEN p.name || ' - ' || si.variation_name
        ELSE p.name
    END AS product_name,
    SUM(si.quantity)::int AS total_quantity_sold,
    SUM(si.subtotal)::bigint AS total_revenue
FROM public."salesItems" si
JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
JOIN public.products p ON p.id = si.product_id
GROUP BY p.business_id, p.id, si.variation_id, si.variation_name, p.name;

CREATE OR REPLACE VIEW public.vw_bottom_products WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    si.variation_id,
    CASE
        WHEN si.variation_id IS NOT NULL THEN p.name || ' - ' || si.variation_name
        ELSE p.name
    END AS product_name,
    COALESCE(SUM(si.quantity), 0)::int AS total_quantity_sold,
    COALESCE(SUM(si.subtotal), 0)::bigint AS total_revenue
FROM public.products p
LEFT JOIN public."salesItems" si ON si.product_id = p.id
LEFT JOIN public."salesTickets" st ON st.id = si.sale_id
    AND st.status::text <> 'returned'::text
WHERE p.is_active = true
GROUP BY p.business_id, p.id, si.variation_id, si.variation_name, p.name;
