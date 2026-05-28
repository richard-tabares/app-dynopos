DROP VIEW IF EXISTS public.vw_inventory_valuation CASCADE;
DROP VIEW IF EXISTS public.vw_stock_status CASCADE;

CREATE OR REPLACE VIEW public.vw_stock_status WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    pv.sku,
    pv.barcode,
    pv.unit_cost::bigint AS unit_cost,
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(pv.stock, 0)::int AS current_stock,
    COALESCE(pv.min_stock, 0)::int AS min_stock,
    p.track_stock,
    pv.id AS variation_id,
    pv.variation_name,
    CASE
        WHEN p.track_stock = false THEN 'sin_control'::text
        WHEN COALESCE(pv.stock, 0) <= 0 THEN 'sin_stock'::text
        WHEN COALESCE(pv.stock, 0) <= COALESCE(pv.min_stock, 0)
             AND COALESCE(pv.min_stock, 0) > 0 THEN 'stock_bajo'::text
        ELSE 'con_stock'::text
    END AS stock_status
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
JOIN public.product_variations pv ON pv.product_id = p.id AND pv.is_active = true
WHERE p.is_active = true

UNION ALL

SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.barcode,
    p.unit_cost::bigint AS unit_cost,
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(i.stock, 0)::int AS current_stock,
    COALESCE(i.min_stock, 0)::int AS min_stock,
    p.track_stock,
    NULL::uuid AS variation_id,
    NULL::text AS variation_name,
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
WHERE p.is_active = true
  AND NOT EXISTS (
      SELECT 1 FROM public.product_variations pv2
      WHERE pv2.product_id = p.id AND pv2.is_active = true
  );

CREATE OR REPLACE VIEW public.vw_inventory_valuation WITH (security_invoker = on) AS
SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    pv.sku,
    pv.barcode,
    COALESCE(pv.stock, 0)::int AS current_stock,
    pv.unit_cost::bigint AS unit_cost,
    (COALESCE(pv.stock, 0)::numeric * pv.unit_cost)::bigint AS total_value,
    pv.id AS variation_id,
    pv.variation_name
FROM public.products p
JOIN public.product_variations pv ON pv.product_id = p.id AND pv.is_active = true
WHERE p.is_active = true AND p.track_stock = true

UNION ALL

SELECT
    p.business_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.barcode,
    COALESCE(i.stock, 0)::int AS current_stock,
    p.unit_cost::bigint AS unit_cost,
    (COALESCE(i.stock, 0)::numeric * p.unit_cost)::bigint AS total_value,
    NULL::uuid AS variation_id,
    NULL::text AS variation_name
FROM public.products p
LEFT JOIN public.inventory i ON i.product_id = p.id
WHERE p.is_active = true AND p.track_stock = true
  AND NOT EXISTS (
      SELECT 1 FROM public.product_variations pv2
      WHERE pv2.product_id = p.id AND pv2.is_active = true
  );
